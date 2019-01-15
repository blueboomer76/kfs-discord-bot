const {Client, Collection, WebhookClient} = require("discord.js"),
	config = require("./config.json"),
	{capitalize} = require("./modules/functions.js"),
	fs = require("fs"),
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
			status: {
				randomIters: 0,
				pos: 0
			}
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
		setTimeout(() => {
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
			fs.writeFile("modules/stats.json", JSON.stringify(stats, null, 4), err => {if (err) throw err;});

			stats2.messageSessionTotal += stats2.messageCurrentTotal;
			stats2.messageCurrentTotal = 0;
			stats2.callSessionTotal += stats2.callCurrentTotal;
			stats2.callCurrentTotal = 0;
			stats2.commandSessionTotal += commandCurrentTotal;
			stats2.commandCurrentTotal = 0;
			stats2.lastCheck = Number(new Date());
			stats2.commandUsage = [];
		}, 1000);
	}
	
	async postBotsOnDiscordStats(bot) {
		request.post({
			url: `https://bots.ondiscord.xyz/bot-api/bots/${bot.user.id}/guilds`,
			headers: {
				"Authorization": config.botsOnDiscordToken
			},
			body: {"guildCount": bot.guilds.size},
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
	
	async postBotsForDiscordStats(bot) {
		request.post({
			url: `https://botsfordiscord.com/api/bot/${bot.user.id}`,
			headers: {
				"Content-Type": "application/json",
				"Authorization": config.discordBotsOrgToken
			},
			body: {"server_count": bot.guilds.size},
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
				console.log(`Failed to post to discordbots.org:\n${err}`);
			} else if (res.statusCode >= 400) {
				console.log(`An unexpected status code ${res.statusCode} was returned from discordbots.org`);
			} else {
				console.log("Stats successfully posted to discordbots.org");
			}
		});
	}
	
	async handlePhoneMessage(message) {
		const phoneCache = this.cache.phone;
		if (phoneCache.channels[0].deleted || phoneCache.channels[1].deleted) {
			this.resetPhone(this);
			return;
		}
		
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
		const phoneCache = bot.cache.phone, dif = Number(new Date()) - phoneCache.lastMsgTime;
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
}

module.exports = KendraBot;