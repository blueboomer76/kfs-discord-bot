const {Client, Collection, Constants, DiscordAPIError, Intents, MessageEmbed} = require("discord.js"),
	{capitalize, checkRemoteRequest} = require("./modules/functions.js"),
	config = require("./config.json"),
	fs = require("fs"),
	request = require("request"),
	Parser = require("rss-parser");

class KFSDiscordBot extends Client {
	constructor(options) {
		super(options);
		this.ownerIDs = config.ownerIDs;
		this.adminIDs = config.adminIDs;
		this.botModIDs = config.botModIDs;
		this.moderatorIDs = config.moderatorIDs;
		this.supportIDs = config.supportIDs;
		this.commands = new Collection();
		this.aliases = new Collection();
		this.slashCommands = new Collection();
		this.categories = [];
		this.prefix = config.prefix;
		this.permLevels = [
			{
				name: "User",
				validate: () => true
			},
			{
				name: "Server Owner",
				validate: interaction => {
					if (!interaction.inGuild()) return false;
					return interaction.guild.ownerId == interaction.user.id;
				}
			},
			{
				name: "Bot Support",
				validate: interaction => this.supportIDs.includes(interaction.user.id)
			},
			{
				name: "Bot Moderator",
				validate: interaction => this.moderatorIDs.includes(interaction.user.id)
			},
			{
				name: "Bot Admin",
				validate: interaction => this.adminIDs.includes(interaction.user.id)
			},
			{
				name: "Bot Owner",
				validate: interaction => this.ownerIDs.includes(interaction.user.id)
			}
		];

		const now = Date.now();
		this.cache = {
			guildCount: 0,
			userCount: 0,
			channelCount: 0,
			phone: {channels: [], msgCount: 0, lastMsgTime: 0, timeout: null},
			recentCommands: new Map(),
			cumulativeStats: {
				duration: 0,
				commandTotal: 0,
				interactionTotal: 0,
				callTotal: 0,
				messageTotal: 0,
				lastSorted: 0,
				commandUsages: {},
				slashCommandUsages: {}
			},
			stats: {
				commandCurrentTotal: 0,
				commandSessionTotal: 0,
				interactionCurrentTotal: 0,
				interactionSessionTotal: 0,
				callCurrentTotal: 0,
				callSessionTotal: 0,
				messageCurrentTotal: 0,
				messageSessionTotal: 0,
				commandUsages: {},
				slashCommandUsages: {},
				lastCheck: now
			},
			status: {randomIters: 0, pos: 0}
		};

		this.intents = new Intents(this.options.intents);

		this.downtimeTimestampBase = now;
		this.unavailableGuildIDs = [];
	}

	loadCommands(altdir) {
		const dir = altdir || "./commands/";
		fs.readdir(dir, (err, files) => {
			if (err) throw err;
			const cmdFiles = files.filter(f => f.endsWith(".js"));
			if (cmdFiles.length > 0) {
				for (const rawFileName of cmdFiles) {
					const fileName = rawFileName.split(".")[0],
						rawCategory = fileName.replace(/-/g, " "),
						category = /[A-Z]/.test(rawCategory) ? rawCategory : capitalize(rawCategory, true);
					let commandClasses;
					try {
						commandClasses = require(dir + fileName + ".js");
					} catch (err) {
						console.error(`The category ${category} failed to load due to:`, err instanceof Error ? err.message : err);
						continue;
					}

					const categoryIndex = this.categories.length;
					this.categories.push({
						id: categoryIndex,
						name: category,
						rawName: fileName
					});

					if (commandClasses.length > 0) {
						for (const CommandClass of commandClasses) {
							const command = new CommandClass();
							command.categoryID = categoryIndex;
							this.commands.set(command.name, command);
							if (command.aliases.length > 0) {
								for (const alias of command.aliases) this.aliases.set(alias, command.name);
							}
						}
						console.log(`${commandClasses.length} commands have been loaded in the category ${category}.`);
					} else {
						console.log("No commands found in the category " + category);
					}
				}
			} else {
				const err = "No command files or commands found in the directory: " + dir;
				if (altdir) {console.error(err)} else {throw new Error(err)}
			}

			const sortedCategories = this.categories.map(c => c); // Deep copy
			sortedCategories.sort((a, b) => {
				if (a.name < b.name) {
					return -1;
				} else if (a.name > b.name) {
					return 1;
				}
				return 0;
			});
			this.categorySortedIndexes = sortedCategories.map(c => c.id);
		});
	}

	async loadSlashCommands(altdir) {
		const dir = altdir || "./commands/slashCommands/";
		fs.readdir(dir, (err, files) => {
			if (err) throw err;
			const cmdFiles = files.filter(f => f.endsWith(".js"));
			if (cmdFiles.length > 0) {
				for (const rawFileName of cmdFiles) {
					const fileName = rawFileName.split(".")[0],
						rawCommandName = fileName.replace(/-/g, " "),
						commandName = /[A-Z]/.test(rawCommandName) ? rawCommandName : capitalize(rawCommandName, true);
					let CommandClass;
					try {
						CommandClass = require(dir + fileName + ".js");
					} catch (err) {
						console.error(`The command with name ${commandName} failed to load due to:`, err instanceof Error ? err.message : err);
						continue;
					}

					const command = new CommandClass();
					this.slashCommands.set(command.name, command);

					console.log(`The command with name ${commandName} has been loaded.`);
				}
			} else {
				const err = "No command files or commands found in the directory: " + dir;
				if (altdir) {console.error(err)} else {throw new Error(err)}
			}
		});
	}

	replaceSlashCommands() {
		const builderJSONArray = this.slashCommands.map(sc => sc.builder.toJSON());
		return this.application.commands.set(builderJSONArray);
	}

	upsertSlashCommand(name) {
		const slashCommand = this.slashCommands.get(name);
		if (!slashCommand) throw new Error("Slash command with name " + name + " not found locally");

		const builderJSON = slashCommand.builder.toJSON();

		return this.application.commands.fetch()
			.then(commands => {
				const slashCommandFromDiscord = commands.find(sc => sc.name == name);
				if (slashCommandFromDiscord) {
					return this.application.commands.edit(slashCommandFromDiscord, builderJSON);
				} else {
					return this.application.commands.create(builderJSON);
				}
			});
	}

	deleteSlashCommand(name) {
		return this.application.commands.fetch()
			.then(commands => {
				const slashCommandFromDiscord = commands.find(sc => sc.name == name);
				if (!slashCommandFromDiscord) throw new Error("Slash command with name " + name + " not found from Discord");

				return this.application.commands.delete(slashCommandFromDiscord);
			});
	}

	loadEvents() {
		fs.readdir("./events/", (err, files) => {
			if (err) throw err;
			const evFiles = files.filter(f => f.endsWith(".js"));
			if (evFiles.length > 0) {
				for (const eventFile of evFiles) {
					const eventName = eventFile.split(".")[0], ev = require("./events/" + eventFile);
					this.on(eventName, ev.bind(null, this));
					delete require.cache[require.resolve("./events/" + eventFile)];
				}
				console.log(evFiles.length + " events have been loaded.");
			} else {
				throw new Error("No events found");
			}
		});
	}

	logStats(writeSync = false) {
		const cachedStats = this.cache.stats,
			cumulativeStats = this.cache.cumulativeStats;
		const now = Date.now();

		cumulativeStats.duration += now - cachedStats.lastCheck;
		if (this.downtimeTimestampBase != null) {
			cumulativeStats.duration -= now - this.downtimeTimestampBase;
			this.downtimeTimestampBase = now;
		}

		const cachedUsages = cachedStats.commandUsages,
			storedUsages = cumulativeStats.commandUsages;
		let commandCurrentTotal = cachedStats.commandCurrentTotal;
		for (const cmdName in cachedUsages) {
			storedUsages[cmdName] = (storedUsages[cmdName] || 0) + cachedUsages[cmdName];
			commandCurrentTotal += cachedUsages[cmdName];
		}
		cumulativeStats.commandTotal += commandCurrentTotal;

		const cachedUsages2 = cachedStats.slashCommandUsages,
			storedUsages2 = cumulativeStats.slashCommandUsages;
		let interactionCurrentTotal = cachedStats.interactionCurrentTotal;
		for (const cmdName in cachedUsages2) {
			storedUsages2[cmdName] = (storedUsages2[cmdName] || 0) + cachedUsages2[cmdName];
			interactionCurrentTotal += cachedUsages2[cmdName];
		}
		cumulativeStats.interactionTotal += interactionCurrentTotal;

		cumulativeStats.callTotal += cachedStats.callCurrentTotal;
		cumulativeStats.messageTotal += cachedStats.messageCurrentTotal;

		if (now > cumulativeStats.lastSorted + 1000 * 86400 * 7) {
			cumulativeStats.lastSorted = now;
			const tempNames = Object.keys(storedUsages),
				tempUses = Object.values(storedUsages),
				tempArray = [],
				newUsages = {};
			for (let i = 0; i < tempNames.length; i++) {
				tempArray.push({name: tempNames[i], uses: tempUses[i]});
			}
			tempArray.sort((a, b) => b.uses - a.uses);
			for (let i = 0; i < tempArray.length; i++) {
				newUsages[tempArray[i].name] = tempArray[i].uses;
			}
			cumulativeStats.commandUsages = newUsages;
		}

		cachedStats.commandSessionTotal += commandCurrentTotal;
		cachedStats.commandCurrentTotal = 0;
		cachedStats.callSessionTotal += cachedStats.callCurrentTotal;
		cachedStats.callCurrentTotal = 0;
		cachedStats.messageSessionTotal += cachedStats.messageCurrentTotal;
		cachedStats.messageCurrentTotal = 0;
		cachedStats.commandUsages = {};
		cachedStats.lastCheck = now;

		const jsonString = JSON.stringify(cumulativeStats, null, 4);
		if (writeSync) {
			fs.writeFileSync("data/stats.json", jsonString);
		} else {
			return new Promise((resolve, reject) => {
				fs.writeFile("data/stats.json", jsonString, err => {
					if (err) reject(err);
					resolve();
				});
			});
		}
	}

	// General function for posting stats
	postStatsToWebsite(website, requestHeader, requestBody) {
		request.post({
			url: website,
			headers: requestHeader,
			body: requestBody,
			json: true
		}, (err, res) => {
			const requestRes = checkRemoteRequest(website, err, res);
			if (requestRes != true) {
				console.error(`[Stats Posting] ${requestRes}`);
			} else {
				console.log(`[Stats Posting] Stats successfully posted to ${website}`);
			}
		});
	}

	postMeme() {
		request.get({
			url: "https://reddit.com/r/memes/hot.json",
			json: true
		}, (err, res) => {
			const requestRes = checkRemoteRequest("Reddit", err, res);
			if (requestRes != true) {
				console.error(`Failed to obtain a meme from Reddit: ${requestRes}`);
			} else {
				const meme = res.body.data.children.filter(r => !r.data.stickied)[0].data;
				this.channels.cache.get(config.memeFeedChannel).send({
					embeds: [
						new MessageEmbed()
							.setTitle(meme.title)
							.setURL("https://reddit.com" + meme.permalink)
							.setColor(Math.floor(Math.random() * 16777216))
							.setFooter({text: `👍 ${meme.score} | 💬 ${meme.num_comments} | 👤 ${meme.author}`})
							.setImage(/v\.redd\.it/.test(meme.url) && meme.preview ? meme.preview.images[0].source.url : meme.url)
					]
				});
			}
		});
	}

	postRSSFeed(amt = 1) {
		const parser = new Parser();
		parser.parseURL(config.rssFeedWebsites[Math.floor(Math.random() * config.rssFeedWebsites.length)])
			.then(feed => {
				const urlList = [];
				for (let i = 0; i < amt; i++) {
					urlList.push(feed.items.splice(Math.floor(Math.random() * feed.items.length), 1)[0].link);
				}
				this.channels.cache.get(config.rssFeedChannel).send(urlList.join("\n"));
			});
	}

	// Functions related to the phone command
	async handlePhoneMessage(message) {
		const phoneCache = this.cache.phone;
		if (this.checkDeletedPhoneChannels()) return;

		const affected = message.channel.id == phoneCache.channels[0].id ? 1 : 0;
		let toSend = message.cleanContent.replace(/https?:\/\/\S+\.\S+/gi, "")
			.replace(/(www\.)?(discord\.(gg|me|io)|discord\.com\/invite)\/[0-9a-z]+/gi, "");
		if (toSend.length > 1500) toSend = toSend.slice(0, 1500) + "...";

		phoneCache.lastMsgTime = Date.now();
		phoneCache.msgCount++;
		setTimeout(() => phoneCache.msgCount--, 5000);

		phoneCache.channels[affected].send(`📞 ${toSend}`)
			.then(() => {
				if (phoneCache.msgCount >= 4) {
					this.resetPhone("☎ The phone connection was cut off due to possible overload.", true);
				}
			})
			.catch(err => {
				if (err instanceof DiscordAPIError && err.code == Constants.APIErrors.UNKNOWN_CHANNEL) {
					this.handlePhoneChannelDelete(phoneCache.channels[affected]);
				}
			});
	}

	async checkPhone() {
		const phoneCache = this.cache.phone;
		if (this.checkDeletedPhoneChannels()) return;

		const dif = Date.now() - phoneCache.lastMsgTime;
		if (dif < 1000*3595) {
			phoneCache.timeout = setTimeout(() => this.checkPhone(), dif);
		} else {
			this.resetPhone("⏰ The phone call has timed out due to inactivity.");
		}
	}

	resetPhone(phoneMsg, overload) {
		const phoneCache = this.cache.phone;
		if (phoneMsg) {
			const ch0 = phoneCache.channels[0],
				ch1 = phoneCache.channels[1];
			if (overload) {
				setTimeout(() => {
					ch0.send(phoneMsg);
					ch1.send(phoneMsg);
				}, 5000);
			} else {
				ch0.send(phoneMsg);
				ch1.send(phoneMsg);
			}
		}
		phoneCache.channels = [];

		let phoneTimeout = phoneCache.timeout;
		if (phoneTimeout) {clearTimeout(phoneTimeout); phoneTimeout = null}
	}

	handlePhoneChannelDelete(deletedChannel) {
		const toSend = deletedChannel.id == this.cache.phone.channels[0].id ? 1 : 0;
		this.cache.phone.channels[toSend].send("⚠ The other side has deleted their channel for which the phone call was made.");
		this.resetPhone();
	}
}

module.exports = KFSDiscordBot;
