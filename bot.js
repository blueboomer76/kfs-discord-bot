const {Client, Collection, WebhookClient} = require("discord.js");
const {capitalize} = require("./modules/functions.js");
const config = require("./config.json");
const fs = require("fs");

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
			statusNum: 0
		};
		if (config.ideaWebhookID && config.ideaWebhookToken) {
			this.ideaWebhook = new WebhookClient(config.ideaWebhookID, config.ideaWebhookToken);
		}
	}
	
	loadCommands() {
		fs.readdir("./commands/", (err1, files1) => {
			if (err1) throw err1;
			const subdirs = files1;
			if (subdirs.length > 0) {
				for (const subdir of subdirs) {
					fs.readdir(`./commands/${subdir}`, (err2, files2) => {
						if (err2) return;
						let cmdFiles = files2.filter(f => f.split(".").pop() == "js");
						if (cmdFiles.length != 0) {
							let category = capitalize(subdir);
							this.categories.push(category);
							for (const cmd of cmdFiles) {
								let CommandClass = require(`./commands/${subdir}/${cmd}`);
								let command = new CommandClass();
								command.category = category;
								this.commands.set(command.name, command);
								if (command.aliases.length > 0) {
									for (const alias of command.aliases) { 
										this.aliases.set(alias, command.name);
									}
								}
							}
							console.log(`${cmdFiles.length} files have been loaded in the category ${subdir}.`);
						} else {
							console.log(`No commands found in the category ${subdir}.`);
						}
					})
				}
			} else {
				throw new Error("No category folders found");
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

	handlePhoneMessage(message) {
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
