const {Client, Collection, WebhookClient} = require("discord.js");
const fs = require("fs");
const request = require("request");
const config = require("./config.json");
const {capitalize} = require("./modules/functions.js");

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
			phone: {channels: [], msgCount: 0, expiresAt: 0},
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
			},
			usage: []
		};
		if (config.ideaWebhook) {
			this.ideaWebhook = new WebhookClient(config.ideaWebhook.id, config.ideaWebhook.token);
		}
	}
	
	loadCommands() {
		fs.readdir("./commands/", (err, files) => {
			if (err) throw err;
			let cmdFiles = files.filter(f => f.split(".").pop() == "js").map(f => f.split(".").shift());
			if (cmdFiles.length != 0) {
				for (let category of cmdFiles) {
					category = capitalize(category);
					this.categories.push(category);
					let commandClasses = require(`./commands/${category}`);
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
				throw new Error("No command files or commands found")
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
		if (require.cache[require.resolve("./modules/stats.json")]) {
			await delete require.cache[require.resolve("./modules/stats.json")];
		}
		setTimeout(() => {
			let stats = JSON.parse(fs.readFileSync("modules/stats.json", "utf8"));
			let stats2 = this.cache.stats;
			stats.duration = stats.duration + (Number(new Date()) - stats2.lastCheck)
			stats.messageTotal += stats2.messageCurrentTotal;
			let distrib = stats.commandDistrib;
			let usageCache = stats2.commandUsage;
			let commandCurrentTotal = stats2.commandCurrentTotal;
			for (let i = 0; i < usageCache.length; i++) {
				let cmdIndex = distrib.findIndex(u => u.command == usageCache[i].command)
				if (cmdIndex != -1) {
					distrib[cmdIndex].uses += usageCache[i].uses;
				} else {
					distrib.push({
						command: usageCache[i].command,
						uses: usageCache[i].uses
					})
				}
				commandCurrentTotal += usageCache[i].uses;
			}
			stats.callTotal += stats2.callCurrentTotal;
			stats.commandTotal += commandCurrentTotal;
			fs.writeFile("modules/stats.json", JSON.stringify(stats), err => {if (err) throw err;});
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
	
	async postBotsDiscordPwStats() {
		request.post({
			url: `https://bots.discord.pw/api/bots/${this.user.id}/stats`,
			headers: {
				"Authorization": config.botsDiscordPwToken
			},
			body: {"server_count": this.guilds.size},
			json: true
		}, (err, res) => {
			if (!err) {
				console.log("Stats successfully posted to bots.discord.pw")
			} else {
				console.log(`Failed to post to bots.discord.pw:\n${err}`)
			}
		})
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
			if (!err) {
				console.log("Stats successfully posted to discordbots.org")
			} else {
				console.log(`Failed to post to discordbots.org:\n${err}`)
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
			let toSend = message.content.replace(/https?\:\/\/\S+\.\S+/gi, "")
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

module.exports = KendraBot;