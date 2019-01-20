const {Client, Collection, RichEmbed, WebhookClient} = require("discord.js"),
	config = require("./config.json"),
	{capitalize} = require("./modules/functions.js"),
	fs = require("fs"),
	Parser = require("rss-parser"),
	request = require("request");

class KendraBot extends Client {
	constructor(options) {
		super(options);
		this.ownerIds = config.ownerIds;
		this.adminIds = config.adminIds;
		this.botModIds = config.botModIds;
		this.moderatorIds = config.moderatorIds;
		this.supportIds = config.supportIds;
		this.commands = new Collection();
		this.aliases = new Collection();
		this.categories = [];
		this.prefix = config.prefix;
		this.permLevels = [
			{
				name: "User",
				validate: () => {return true}
			},
			{
				name: "Server Owner",
				validate: message => {
					return message.guild.owner.user.id == message.author.id;
				}
			},
			{
				name: "Bot Support",
				validate: message => {
					return this.supportIds.includes(message.author.id);
				}
			},
			{
				name: "Bot Moderator",
				validate: message => {
					return this.moderatorIds.includes(message.author.id);
				}
			},
			{
				name: "Bot Admin",
				validate: message => {
					return this.adminIds.includes(message.author.id);
				}
			},
			{
				name: "Bot Owner",
				validate: message => {
					return this.ownerIds.includes(message.author.id);
				}
			}
		];
		this.cache = {
			guildCount: 0,
			userCount: 0,
			channelCount: 0,
			phone: {channels: [], msgCount: 0, lastMsgTime: 0, timeout: null},
			recentCommands: [],
			stats: {
				lastCheck: Number(new Date()),
				messageCurrentTotal: 0,
				messageSessionTotal: 0,
				callCurrentTotal: 0,
				callSessionTotal: 0,
				commandCurrentTotal: 0,
				commandSessionTotal: 0,
				commandUsage: []
			},
			status: {randomIters: 0, pos: 0}
		};
		if (config.ideaWebhook) {
			this.ideaWebhook = new WebhookClient(config.ideaWebhook.id, config.ideaWebhook.token);
		}
	}
	
	loadCommands() {
		fs.readdir("./commands/", (err, files) => {
			if (err) throw err;
			const cmdFiles = files.filter(f => f.split(".").pop() == "js").map(f => f.split(".").shift());
			if (cmdFiles.length != 0) {
				for (let category of cmdFiles) {
					category = capitalize(category.replace(/-/g, " "));
					this.categories.push(category);
					const commandClasses = require(`./commands/${category.toLowerCase().replace(/ /g, "-")}`);
					if (commandClasses.length > 0) {
						for (const CommandClass of commandClasses) {
							const command = new CommandClass();
							command.category = category;
							this.commands.set(command.name, command);
							if (command.aliases.length > 0) {
								for (const alias of command.aliases) { 
									this.aliases.set(alias, command.name);
								}
							}
						}
						console.log(`${commandClasses.length} commands have been loaded in the category ${category}.`);
					} else {
						console.log(`No commands found in the category ${category}.`);
					}
				}
			} else {
				throw new Error("No command files or commands found");
			}
		});
	}
	
	loadEvents() {
		fs.readdir("./events/", (err, files) => {
			if (err) throw err;
			const evFiles = files.filter(f => f.split(".").pop() == "js");
			if (evFiles.length > 0) {
				for (const eventFile of evFiles) {
					const eventName = eventFile.split(".")[0], ev = require(`./events/${eventFile}`);
					this.on(eventName, ev.bind(null, this));
					delete require.cache[require.resolve(`./events/${eventFile}`)];
				}
				console.log(`${evFiles.length} events have been loaded.`);
			} else {
				throw new Error("No events found");
			}
		});
	}
	
	async logStats() {
		if (require.cache[require.resolve("./modules/stats.json")]) {
			await delete require.cache[require.resolve("./modules/stats.json")];
		}
		const stats = JSON.parse(fs.readFileSync("modules/stats.json", "utf8")),
			stats2 = this.cache.stats;
		stats.duration = stats.duration + (Number(new Date()) - stats2.lastCheck);
		stats.messageTotal += stats2.messageCurrentTotal;

		const distrib = stats.commandDistrib,
			usageCache = stats2.commandUsage;
		let commandCurrentTotal = stats2.commandCurrentTotal;
		for (const entry of usageCache) {
			const cmdIndex = distrib.findIndex(u => u.command == entry.command);
			if (cmdIndex != -1) {
				distrib[cmdIndex].uses += entry.uses;
			} else {
				distrib.push({command: entry.command, uses: entry.uses});
			}
			commandCurrentTotal += entry.uses;
		}
		stats.callTotal += stats2.callCurrentTotal;
		stats.commandTotal += commandCurrentTotal;
		distrib.sort((a,b) => b.uses - a.uses);
		fs.writeFileSync("modules/stats.json", JSON.stringify(stats, null, 4), err => {if (err) throw err;});

		stats2.messageSessionTotal += stats2.messageCurrentTotal;
		stats2.messageCurrentTotal = 0;
		stats2.callSessionTotal += stats2.callCurrentTotal;
		stats2.callCurrentTotal = 0;
		stats2.commandSessionTotal += commandCurrentTotal;
		stats2.commandCurrentTotal = 0;
		stats2.lastCheck = Number(new Date());
		stats2.commandUsage = [];
	}
	
	// Optional functions
	async postBotsOnDiscordStats() {
		request.post({
			url: `https://bots.ondiscord.xyz/bot-api/bots/${this.user.id}/guilds`,
			headers: {
				"Authorization": config.botsOnDiscordToken
			},
			body: {"guildCount": this.guilds.size},
			json: true
		}, (err, res) => {
			if (err) {
				console.log(`Failed to post to bots.ondiscord.xyz:\n${err}`);
			} else if (res.statusCode >= 400) {
				console.log(`An unexpected status code ${res.statusCode} was returned from bots.ondiscord.xyz`);
			} else {
				console.log("Stats successfully posted to bots.ondiscord.xyz");
			}
		});
	}
	
	async postBotsForDiscordStats() {
		request.post({
			url: `https://botsfordiscord.com/api/bot/${this.user.id}`,
			headers: {
				"Content-Type": "application/json",
				"Authorization": config.botsForDiscordToken
			},
			body: {"server_count": this.guilds.size},
			json: true
		}, (err, res) => {
			if (err) {
				console.log(`Failed to post to botsfordiscord.com:\n${err}`);
			} else if (res.statusCode >= 400) {
				console.log(`An unexpected status code ${res.statusCode} was returned from botsfordiscord.com`);
			} else {
				console.log("Stats successfully posted to botsfordiscord.com");
			}
		});
	}
	
	async postDiscordBotsOrgStats() {
		request.post({
			url: `https://discordbots.org/api/bots/${this.user.id}/stats`,
			headers: {
				"Authorization": config.discordBotsOrgToken
			},
			body: {"server_count": this.guilds.size},
			json: true
		}, (err, res) => {
			if (err) {
				console.log(`Failed to post to discordbots.org:\n${err}`);
			} else if (res.statusCode >= 400) {
				console.log(`An unexpected status code ${res.statusCode} was returned from discordbots.org`);
			} else {
				console.log("Stats successfully posted to discordbots.org");
			}
		});
	}
	
	postMeme() {
		request.get({
			url: "https://reddit.com/r/memes/hot.json",
			json: true
		}, (err, res) => {
			if (err) {console.log(err); return}
			const entry = res.body.data.children[0];
			this.channels.get(config.ownerServer.memeFeed).send(new RichEmbed()
				.setTitle(entry.data.title)
				.setURL(`https://reddit.com${entry.data.permalink}`)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter(`👍 ${entry.data.score} | 💬 ${entry.data.num_comments} | By: ${entry.data.author}`)
				.setImage(entry.data.url)
			);
		});
	}

	postRssFeed(amt = 1) {
		const parser = new Parser();
		parser.parseURL(config.rssFeedWebsites[Math.floor(Math.random() * config.rssFeedWebsites.length)])
			.then(feed => {
				const urlList = [];
				for (let i = 0; i < amt; i++) {
					urlList.push(feed.items.splice(Math.floor(Math.random() * feed.items.length), 1)[0].link);
				}
				this.channels.get(config.ownerServer.rssFeed).send(urlList.join("\n"));
			});
	}

	// Functions related to the phone command
	async handlePhoneMessage(message) {
		const phoneCache = this.cache.phone;
		if (this.checkDeletedPhoneChannels(this)) return;
		
		const toSend = message.cleanContent.replace(/https?:\/\/\S+\.\S+/gi, "")
			.replace(/(www\.)?(discord\.(gg|me|io)|discordapp\.com\/invite)\/[0-9a-z]+/gi, "");
		let affected = 0;
		
		phoneCache.lastMsgTime = Number(new Date());
		phoneCache.msgCount++;
		setTimeout(() => {phoneCache.msgCount--}, 5000);
		if (message.channel.id == phoneCache.channels[0].id) affected = 1;
		
		phoneCache.channels[affected].send(`📞 ${toSend}`);
		if (phoneCache.msgCount > 4) {
			this.resetPhone(this, "☎️ The phone connection was cut off due to being overloaded.");
		}
	}
	
	async checkPhone(bot) {
		const phoneCache = bot.cache.phone;
		if (bot.checkDeletedPhoneChannels(bot)) return;

		const dif = Number(new Date()) - phoneCache.lastMsgTime;
		if (dif < 1000*3595) {
			phoneCache.timeout = setTimeout(bot.checkPhone, dif, bot);
		} else {
			bot.resetPhone(bot, "⏰ The phone call has timed out due to inactivity.");
		}
	}
	
	resetPhone(bot, phoneMsg) {
		const phoneCache = bot.cache.phone;
		if (phoneMsg) {
			phoneCache.channels[0].send(phoneMsg);
			phoneCache.channels[1].send(phoneMsg);
		}
		phoneCache.channels = [];
		
		let phoneTimeout = phoneCache.timeout;
		if (phoneTimeout) {clearTimeout(phoneTimeout); phoneTimeout = null}
	}

	checkDeletedPhoneChannels(bot) {
		const phoneCache = bot.cache.phone,
			ch0deleted = phoneCache.channels[0] ? (phoneCache.channels[0].deleted ? true : false) : null,
			ch1deleted = phoneCache.channels[1] ? (phoneCache.channels[1].deleted ? true : false) : null;
		if (ch0deleted == true || ch1deleted == true) {
			const phoneMsg = "⚠ The other side has deleted their channel for which the phone call was made.";
			if (ch0deleted == true && ch1deleted == false) {
				phoneCache.channels[1].send(phoneMsg);
			} else if (ch0deleted == false && ch1deleted == true) {
				phoneCache.channels[0].send(phoneMsg);
			}
			bot.resetPhone(bot);
			return true;
		}
		return false;
	}
}

module.exports = KendraBot;