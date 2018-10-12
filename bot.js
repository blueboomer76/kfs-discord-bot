const {Client, Collection, WebhookClient} = require("discord.js");
const {capitalize} = require("./modules/functions.js");
const config = require("./config.json");
const fs = require("fs");
const request = require("request");

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
			phone: {channels: [], msgCount: 0, callExpires: 0},
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
			let cmdFiles = files.filter(f => f.split(".").pop() == "js");
			if (cmdFiles.length > 0) {
				for (const fileName of cmdFiles) {
					let rawCategory = fileName.split(".").shift();
					let category = capitalize(rawCategory);
					this.categories.push(category);
					let commandClasses = require(`./commands/${fileName}`);
					if (commandClasses.length > 0) {
						for (const CommandClass of commandClasses) {
							let command = new CommandClass();
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
					let eventName = eventFile.split(".")[0];
					let ev = require(`./events/${eventFile}`);
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
			let storedStats = JSON.parse(data);
			let cachedStats = this.cache.stats;

			storedStats.duration += Number(new Date()) - cachedStats.lastCheck;

			let storedUsages = storedStats.commandUsages;
			let cachedUsages = cachedStats.commandUsages;
			let commandCurrentTotal = cachedStats.commandCurrentTotal;
			for (let i = 0; i < cachedUsages.length; i++) {
				let cmdIndex = storedUsages.findIndex(u => u.command == cachedUsages[i].command);
				if (cmdIndex != -1) {
					storedUsages[cmdIndex].uses += cachedUsages[i].uses;
				} else {
					storedUsages.push({
						command: cachedUsages[i].command,
						uses: cachedUsages[i].uses
					})
				}
				commandCurrentTotal += cachedUsages[i].uses;
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

	async postBotsDiscordPwStats(bot) {
		request.post({
			url: `https://bots.discord.pw/api/bots/${bot.user.id}/stats`,
			headers: {
				"Authorization": config.botsDiscordPwToken
			},
			body: {"server_count": bot.guilds.size},
			json: true
		}, (err, res) => {
			if (err) {
				console.log(`[Stats Posting] Could not request to bots.discord.pw: ${err.message}`);
			} else if (!res) {
				console.log("[Stats Posting] No response was received from bots.discord.pw.");
			} else if (res.statusCode >= 400) {
				console.log(`[Stats Posting] The request to bots.discord.pw failed with status code ${res.statusCode} (${res.statusMessage})`);
			} else {
				console.log("[Stats Posting] Stats successfully posted to bots.discord.pw");
			}
		})
	}
	
	async postDiscordBotsOrgStats(bot) {
		request.post({
			url: `https://discordbots.org/api/bots/${bot.user.id}/stats`,
			headers: {
				"Authorization": config.discordBotsOrgToken
			},
			body: {"server_count": bot.guilds.size},
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

	async handlePhoneMessage(message) {
		let phoneCache = this.cache.phone;
		if (phoneCache.callExpires > Number(new Date())) {
			phoneCache.callExpires = Number(new Date()) + 600000;
			phoneCache.msgCount++;
			setTimeout(() => {phoneCache.msgCount--;}, 5000);
			let affected = 0;
			if (message.channel.id == phoneCache.channels[0]) {affected = 1};
			let toSend = message.content.replace(/https?:\/\/\S+\.\S+/gi, "")
			.replace(/(www\.)?(discord\.(gg|me|io)|discordapp\.com\/invite)\/[0-9a-z]+/gi, "")
			this.channels.get(phoneCache.channels[affected]).send(`📞 ${toSend}`);
			if (phoneCache.msgCount > 4) {
				let phoneMsg = "☎️ The phone connection was cut off due to being overloaded."
				this.channels.get(phoneCache.channels[0]).send(phoneMsg);
				this.channels.get(phoneCache.channels[1]).send(phoneMsg);
				phoneCache.channels = [];
			}
		} else {
			let phoneMsg = "☎️ The phone call has timed out due to inactivity."
			this.channels.get(phoneCache.channels[0]).send(phoneMsg);
			this.channels.get(phoneCache.channels[1]).send(phoneMsg);
			phoneCache.channels = [];
		}
	}
}

module.exports = KFSDiscordBot;
