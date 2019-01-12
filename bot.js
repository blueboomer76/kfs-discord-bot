const {Client, Collection, WebhookClient} = require("discord.js"),
	{capitalize} = require("./modules/functions.js"),
	config = require("./config.json"),
	fs = require("fs"),
	request = require("request");

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
					if (!message.guild) return false;
					return message.guild.owner.user.id == message.author.id;
				}
			},
			{
				name: "Bot Support",
				validate: message => {
					return this.supportIDs.includes(message.author.id);
				}
			},
			{
				name: "Bot Moderator",
				validate: message => {
					return this.moderatorIDs.includes(message.author.id);
				}
			},
			{
				name: "Bot Admin",
				validate: message => {
					return this.adminIDs.includes(message.author.id);
				}
			},
			{
				name: "Bot Owner",
				validate: message => {
					return this.ownerIDs.includes(message.author.id);
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
				commandCurrentTotal: 0,
				commandSessionTotal: 0,
				callCurrentTotal: 0,
				callSessionTotal: 0,
				messageCurrentTotal: 0,
				messageSessionTotal: 0,
				commandUsages: [],
				lastCheck: Number(new Date())
			},
			status: {randomIters: 0, pos: 0}
		};
		if (config.ideaWebhookID && config.ideaWebhookToken) {
			this.ideaWebhook = new WebhookClient(config.ideaWebhookID, config.ideaWebhookToken);
		}
	}
	
	loadCommands() {
		fs.readdir("./commands/", (err, files) => {
			if (err) throw err;
			const cmdFiles = files.filter(f => f.split(".").pop() == "js");
			if (cmdFiles.length > 0) {
				for (const fileName of cmdFiles) {
					const rawCategory = fileName.split(".").shift(),
						category = capitalize(rawCategory.replace(/-/g, " "));
					this.categories.push(category);
					const commandClasses = require(`./commands/${fileName}`);
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
		})
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
		})
	}
	
	async logStats() {
		delete require.cache[require.resolve("./modules/stats.json")];

		fs.readFile("modules/stats.json", {encoding: "utf8"}, (err, data) => {
			if (err) {console.error(err); return}
			const storedStats = JSON.parse(data),
				cachedStats = this.cache.stats;

			storedStats.duration += Number(new Date()) - cachedStats.lastCheck;

			const storedUsages = storedStats.commandUsages,
				cachedUsages = cachedStats.commandUsages;
			let commandCurrentTotal = cachedStats.commandCurrentTotal;
			for (const entry of cachedUsages) {
				const cmdIndex = storedUsages.findIndex(u => u.command == entry.command);
				if (cmdIndex != -1) {
					storedUsages[cmdIndex].uses += entry.uses;
				} else {
					storedUsages.push({
						command: entry.command,
						uses: entry.uses
					})
				}
				commandCurrentTotal += entry.uses;
			}
			storedStats.commandTotal += commandCurrentTotal;
			storedStats.callTotal += cachedStats.callCurrentTotal;
			storedStats.messageTotal += cachedStats.messageCurrentTotal;

			fs.writeFile("modules/stats.json", JSON.stringify(storedStats, null, 4), err => {if (err) throw err});

			cachedStats.commandSessionTotal += commandCurrentTotal;
			cachedStats.commandCurrentTotal = 0;
			cachedStats.callSessionTotal += cachedStats.callCurrentTotal;
			cachedStats.callCurrentTotal = 0;
			cachedStats.messageSessionTotal += cachedStats.messageCurrentTotal;
			cachedStats.messageCurrentTotal = 0;
			cachedStats.commandUsages = [];
			cachedStats.lastCheck = Number(new Date());
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
				console.log(`[Stats Posting] Could not request to discordbots.org: ${err.message}`);
			} else if (!res) {
				console.log("[Stats Posting] No response was received from discordbots.org.");
			} else if (res.statusCode >= 400) {
				console.log(`[Stats Posting] The request to discordbots.org failed with status code ${res.statusCode} (${res.statusMessage})`);
			} else {
				console.log("[Stats Posting] Stats successfully posted to discordbots.org");
			}
		})
	}
	
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
				console.log(`[Stats Posting] Could not request to bots.ondiscord.xyz: ${err.message}`);
			} else if (!res) {
				console.log("[Stats Posting] No response was received from bots.ondiscord.xyz.");
			} else if (res.statusCode >= 400) {
				console.log(`[Stats Posting] The request to bots.ondiscord.xyz failed with status code ${res.statusCode} (${res.statusMessage})`);
			} else {
				console.log("[Stats Posting] Stats successfully posted to bots.ondiscord.xyz");
			}
		})
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
				console.log(`[Stats Posting] Could not request to botsfordiscord.com: ${err.message}`);
			} else if (!res) {
				console.log("[Stats Posting] No response was received from botsfordiscord.com.");
			} else if (res.statusCode >= 400) {
				console.log(`[Stats Posting] The request to botsfordiscord.com failed with status code ${res.statusCode} (${res.statusMessage})`);
			} else {
				console.log("[Stats Posting] Stats successfully posted to botsfordiscord.com");
			}
		})
	}
	
	async handlePhoneMessage(message) {
		const phoneCache = this.cache.phone;
		if (phoneCache.channels[0].deleted || phoneCache.channels[1].deleted) {
			this.resetPhone(this);
			return;
		}
		
		let affected = 0,
			toSend = message.cleanContent.replace(/https?:\/\/\S+\.\S+/gi, "")
			.replace(/(www\.)?(discord\.(gg|me|io)|discordapp\.com\/invite)\/[0-9a-z]+/gi, "");
		
		phoneCache.lastMsgTime = Number(new Date());
		phoneCache.msgCount++;
		setTimeout(() => {phoneCache.msgCount--;}, 5000);
		if (message.channel.id == phoneCache.channels[0].id) affected = 1;
		if (toSend.length > 1500) toSend = `${toSend.slice(0, 1500)}...`;

		phoneCache.channels[affected].send(`📞 ${toSend}`);
		if (phoneCache.msgCount >= 4) {
			this.resetPhone("☎ The phone connection was cut off due to possible overload.", true);
		}
	}
	
	async checkPhone() {
		const phoneCache = this.cache.phone, dif = Number(new Date()) - phoneCache.lastMsgTime;
		if (dif < 1000*3595) {
			phoneCache.timeout = setTimeout(() => {this.checkPhone()}, dif);
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
		if (phoneTimeout) {clearTimeout(phoneTimeout); phoneTimeout = null;}
	}
}

module.exports = KFSDiscordBot;
