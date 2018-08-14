const {Client, Collection, WebhookClient} = require("discord.js");
const fs = require("fs");
const config = require("./config.json");

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
		this.cache = {
			permLevels: [
				{
					name: "User",
					validate: () => {return true;}
				},
				{
					name: "Moderator",
					validate: message => {
						let nameRegex = /Moderator|Mod/i
						let role = message.guild.roles.find(r => nameRegex.test(r.name))
						if (role && message.member.roles.has(role.id)) return true;
						return false;
					}
				},
				{
					name: "Server Bot Moderator",
					desc: "Have a role named `Kendra Bot Commander`",
					validate: message => {
						let role = message.guild.roles.find(r => r.name == "Kendra Bot Commander")
						if (role && message.member.roles.has(role.id)) return true;
						return false;
					}
				},
				{
					name: "Administrator",
					validate: message => {
						let nameRegex = /Administrator|Admin/i
						let role = message.guild.roles.find(r => nameRegex.test(r.name))
						if (role && message.member.roles.has(role.id)) return true;
						if (message.member.hasPermission("MANAGE_SERVER")) return true;
						return false;
					}
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
						return this.supportIds.indexOf(message.author.id) != -1;
					}
				},
				{
					name: "Bot Moderator",
					validate: message => {
						return this.moderatorIds.indexOf(message.author.id) != -1;
					}
				},
				{
					name: "Bot Admin",
					validate: message => {
						return this.adminIds.indexOf(message.author.id) != -1;
					}
				},
				{
					name: "Owner",
					validate: message => {
						return this.ownerIds.indexOf(message.author.id) != -1;
					}
				}
			],
			messages: {
				sessionCount: 0,
				currentCount: 0,
				lastCheck: Number(new Date())
			},
			guildCount: 0,
			userCount: 0,
			phone: {channels: [], msgCount: 0, expiresAt: 0},
			recentCommands: [],
			usage: []
		};
		this.ideaWebhook = new WebhookClient("477953968455155714", config.ideaWebhookToken);
	}
	
	loadCommands() {
		fs.readdir("./commands/", (err, files) => {
			if (err) throw err;
			const subdirs = files;
			if (subdirs.length > 0) {
				for (const subdir of subdirs) {
					fs.readdir(`./commands/${subdir}`, (err, files) => {
						if (err) throw err;
						let cmdFiles = files.filter(f => f.split(".").pop() == "js");
						if (cmdFiles.length != 0) {
							for (const cmd of cmdFiles) {
								let CommandClass = require(`./commands/${subdir}/${cmd}`);
								let command = new CommandClass();
								command.category = subdir;
								this.commands.set(command.name, command);
								if (command.aliases.length > 0) {
									for (const alias of command.aliases) { 
										this.aliases.set(alias, command.name);
									}
								}
							}
							console.log(`${cmdFiles.length} files have been loaded in the category ${subdir}.`);
						} else {
							console.log(`No commands found in the category ${subdir}`);
						}
					})
				}
			} else {
				throw "No category folders found";
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
				throw "No events were found!"
			}
		})
	}
	
	logStats() {
		let stats = JSON.parse(fs.readFileSync("modules/stats.json", "utf8"));
		stats.messages.count += this.cache.messages.currentCount;
		stats.messages.duration = stats.messages.duration + (Number(new Date()) - this.cache.messages.lastCheck)
		let usage = stats.commandUsage;
		let usageCache = this.cache.usage;
		for (let i = 0; i < usageCache.length; i++) {
			let cmdIndex = usage.findIndex(u => u.command == usageCache[i].command)
			if (cmdIndex != -1) {
				usage[cmdIndex].uses += usageCache[i].uses;
			} else {
				usage.push({
					command: usageCache[i].command,
					uses: usageCache[i].uses
				})
			}
		}
		fs.writeFile("modules/stats.json", JSON.stringify(stats), err => {if (err) throw err;});
		this.cache.messages.sessionCount += this.cache.messages.currentCount;
		this.cache.messages.currentCount = 0;
		this.cache.messages.lastCheck = Number(new Date());
		this.cache.usage = [];
	}
	
	handlePhoneMessage(message) {
		let phoneCache = this.cache.phone;
		if (phoneCache.callExpires > Number(new Date())) {
			phoneCache.callExpires = Number(new Date()) + 600000;
			phoneCache.msgCount++;
			setTimeout(() => {phoneCache.msgCount--;}, 5000);
			let affected = 0;
			if (message.channel.id == phoneCache.channels[0]) {affected = 1};
			let toSend = message.content.replace(/https?\:\/\/[^ ]+\.[^ ]+/gi, "")
			.replace(/discord\.gg\/[0-9a-z]+/gi, "")
			.replace(/discordapp\.com\/invite\/[0-9a-z]+/gi, "")
			this.channels.get(phoneCache.channels[affected]).send(":telephone_receiver: " + toSend);
			if (phoneCache.msgCount > 4) {
				let phoneMsg = "☎️ The phone connection was cut off due to being overloaded."
				this.channels.get(phoneCache.channels[0]).send(phoneMsg);
				this.channels.get(phoneCache.channels[1]).send(phoneMsg);
				phoneCache.channels = [];
			}
		} else {
			let phoneMsg = "⏰ The phone call has timed out due to inactivity."
			this.channels.get(phoneCache.channels[0]).send(phoneMsg);
			this.channels.get(phoneCache.channels[1]).send(phoneMsg);
			phoneCache.channels = [];
		}
	}
}

module.exports = KendraBot;