const Discord = require("discord.js");
const Command = require("../structures/command.js");
const packageInfo = require("../package.json");
const {capitalize, getDuration, parsePerm} = require("../modules/functions.js");
const stats = require("../modules/stats.json");
const paginator = require("../utils/paginator.js");

module.exports = [
	class BotInfoCommand extends Command {
		constructor() {
			super({
				name: "botinfo",
				description: "Get general info about the bot",
				aliases: ["about", "bot", "info"],
				allowDMs: true,
				cooldown: {
					time: 60000,
					type: "guild"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}
		
		async run(bot, message, args, flags) {
			message.channel.send(new Discord.RichEmbed()
			.setTitle("About Kendra")
			.setDescription("Kendra is an actively developed bot that not only has fun, moderation, utility commands, but a phone command for calling other servers, and combines features from popular bots. New commands are added to Kendra often.")
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter(`Bot ID: ${bot.user.id}`)
			.addField("Library", `Discord.js v${packageInfo.dependencies["discord.js"].slice(1)}`, true)
			.addField("Bot Version", `${packageInfo.version}`, true)
			.addField("Stats", `${bot.cache.guildCount} Servers\n${bot.cache.userCount} Users`, true)
			.addField("Bot Invite", `[Go!](https://discordapp.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=403041398&scope=bot)`, true)
			.addField("Kendra's server", "[Go!](https://discord.gg/yB8TvWU)", true)
			.addField("Upvote this bot", "[Go!](https://discordbots.org/bots/429807759144386572)", true)
			);
		}
	},
	class HelpCommand extends Command {
		constructor() {
			super({
				name: "help",
				description: "Get help for a command, or see all commands available.",
				allowDMs: true,
				args: [
					{
						num: 1,
						optional: true,
						type: "command"
					}
				],
				cooldown: {
					time: 8000,
					type: "user"
				},
				flags: [
					{
						name: "dm",
						desc: "Sends the help message to DMs instead"
					},
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				},
				usage: "help [command]"
			});
		}
		
		async run(bot, message, args, flags) {
			let command = args[0], helpEmbed = new Discord.RichEmbed();
			if (!command) {
				helpEmbed.setTitle("All the commands for this bot")
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter(`Use k,help <command> to get help for a command | Total commands: ${bot.commands.size}`);
				let cmds = bot.commands;
				if (!bot.ownerIds.includes(message.author.id) && !bot.adminIds.includes(message.author.id)) {
					cmds = cmds.filter(cmd => !cmd.hidden);
				}
				for (let i = 0; i < bot.categories.length; i++) {
					let cmdsInCat = cmds.filter(cmd => cmd.category == bot.categories[i]).map(cmd => cmd.name);
					helpEmbed.addField(bot.categories[i], Array.from(cmdsInCat).join(", "));
				}
			} else {
				let commandFlags = command.flags.map(f => `\`--${f.name}\` (\`-${f.name.charAt(0)}\`): ${f.desc}`);
				let commandPerms = command.perms;
				let permReq = {
					bot: commandPerms.bot.length > 0 ? commandPerms.bot.map(p => parsePerm(p)).join(", ") : "None",
					user: commandPerms.user.length > 0 ? commandPerms.user.map(p => parsePerm(p)).join(", ") : "None",
					role: commandPerms.role ? `\nRequires having a role named ${commandPerms.role}.` : "",
					level: commandPerms.level > 0 ? `\nRequires being ${bot.permLevels[commandPerms.level].name}.` : ""
				};
				helpEmbed.setTitle(`Help - ${command.name}`)
				.setColor(Math.floor(Math.random() * 16777216))
				.addField("Category", command.category)
				.addField("Description", command.description)
				.addField("Aliases", command.aliases.length > 0 ? command.aliases.join(", ") : "None")
				.addField("Flags", command.flags.length > 0 ? commandFlags.join("\n") : "None")
				.addField("Usage", command.usage)
				.addField("Examples", command.examples.length > 0 ? command.examples.join("\n") : "No examples provided")
				.addField("Permissions", `Bot - ${permReq.bot}\nUser - ${permReq.user}${permReq.role}${permReq.level}`)
				.addField("Cooldown", `${command.cooldown.time / 1000} seconds per ${command.cooldown.type}`)
			}
			if (flags.find(f => f.name == "dm")) {
				message.member.send(helpEmbed);
			} else {
				message.channel.send(helpEmbed);
			}
		}
	},
	class InviteCommand extends Command {
		constructor() {
			super({
				name: "invite",
				description: "Get info about inviting the bot, joining the bot's server, or its references",
				allowDMs: true,
				cooldown: {
					time: 30000,
					type: "guild"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}
		
		async run(bot, message, args, flags) {
			message.channel.send(new Discord.RichEmbed()
			.setTitle("Kendra's References")
			.setDescription("Exciting, huh? Now you have the chance to spread the love! uwu")
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter("Made by blueboomer#4939")
			.addField("Bot Invite", "[Go!](https://discordapp.com/api/oauth2/authorize?client_id=429807759144386572&permissions=403041398&scope=bot)")
			.addField("Kendra's server", "[Go!](https://discord.gg/yB8TvWU)")
			.addField("Upvote this bot", "[Go!](https://discordbots.org/bots/429807759144386572)")
			.addField("Github", "[Go!](https://github.com/blueboomer76/KendraBot)")
			);
		}
	},
	class LoadCommand extends Command {
		constructor() {
			super({
				name: "load",
				description: "Loads a command",
				allowDMs: true,
				args: [
					{
						num: Infinity,
						type: "string",
						allowQuotes: true
					},
					{
						num: 1,
						type: "string"
					}
				],
				cooldown: {
					time: 0,
					type: "user"
				},
				hidden: true,
				perms: {
					bot: [],
					user: [],
					level: 4
				},
				usage: "load <category> <command>"
			});
		}
		
		async run(bot, message, args, flags) {
			let category = args[0];
			let commandName = args[1];
			
			if (bot.commands.get(commandName)) return message.channel.send("A command with that name is already loaded.")
			try {
				delete require.cache[require.resolve(`./${category.toLowerCase().replace(/ /g, "-")}.js`)];
				let commandClasses = require(`./${category.toLowerCase().replace(/ /g, "-")}.js`);
				let CommandClass = commandClasses.find(c => c.name.toLowerCase().startsWith(args[1]));
				let command = new CommandClass();
				command.category = capitalize(category, true);
				bot.commands.set(commandName, command);
				if (command.aliases.length > 0) {
					for (const alias of command.aliases) { 
						bot.aliases.set(alias, command.name);
					}
				}
				message.channel.send(`The command ${commandName} was loaded.`);
			} catch(err) {
				message.channel.send(`A problem has occurred: \`${err}\``);
			}
		}
	},
	class PhoneCommand extends Command {
		constructor() {
			super({
				name: "phone",
				description: "Chat with other servers on the phone!",
				aliases: ["telephone"],
				cooldown: {
					time: 60000,
					type: "channel"
				}
			});
		}
		
		async run(bot, message, args, flags) {
			let phoneMsg, phoneMsg0, phoneCache = bot.cache.phone;
			if (!phoneCache.channels.includes(message.channel.id)) {
				phoneCache.channels.push(message.channel.id);
				if (phoneCache.channels.length == 1) {
					message.react("☎");
				} else {
					bot.cache.stats.callCurrentTotal++;
					phoneCache.lastMsgTime = Number(new Date());
					setTimeout(bot.checkPhone, 1000*600, bot);
					
					message.channel.send("☎ A phone connection has started! Greet the other side!");
					if (phoneCache.channels.length == 2) {
						phoneMsg0 = "The other side has picked up the phone! Greet the other side!";
					} else {
						phoneMsg0 = "Looks like someone else picked up the phone."
						bot.channels.get(phoneCache.channels.shift()).send("☎ Someone else is now using the phone...");
					}
					bot.channels.get(phoneCache.channels[0]).send(`☎ ${phoneMsg0}`)
				}
			} else {
				if (phoneCache.channels.length == 1) {
					phoneMsg = "There was no response from the phone, hanging it up.";
				} else {
					let affected = 0;
					if (message.channel.id == phoneCache.channels[0]) affected = 1;
					phoneMsg = "You have hung up the phone.";
					bot.channels.get(phoneCache.channels[affected]).send("☎ The other side hung up the phone.");
				}
				phoneCache.channels = [];
				message.channel.send(`☎ ${phoneMsg}`);
			}
		}
	},
	class PingCommand extends Command {
		constructor() {
			super({
				name: "ping",
				description: "Get bot ping and latency",
				allowDMs: true,
				cooldown: {
					time: 15000,
					type: "channel"
				}
			});
		}
		
		async run(bot, message, args, flags) {
			const msg = await message.channel.send("Ping?");
			msg.edit(`🏓 **Pong!**\nLatency: ${msg.createdTimestamp - message.createdTimestamp}ms\nAPI Latency: ${Math.round(bot.ping)}ms`)
		}
	},
	class ReloadCommand extends Command {
		constructor() {
			super({
				name: "reload",
				description: "Reload a command. It must be a command that is already loaded",
				allowDMs: true,
				args: [
					{
						num: 1,
						type: "command"
					}
				],
				cooldown: {
					time: 0,
					type: "user"
				},
				hidden: true,
				perms: {
					bot: [],
					user: [],
					level: 4
				},
				usage: "reload <command>"
			});
		}
		
		async run(bot, message, args, flags) {
			let command = args[0];
			let commandName = command.name;
			let category = command.category;
			try {
				delete require.cache[require.resolve(`./${category.toLowerCase().replace(/ /g, "-")}.js`)];
				let commandClasses = require(`./${category.toLowerCase().replace(/ /g, "-")}.js`);
				let CommandClass = commandClasses.find(c => c.name.toLowerCase().startsWith(args[0].name));
				let command = new CommandClass();
				command.category = category;
				bot.commands.set(commandName, command);
				if (command.aliases.length > 0) {
					for (const alias of command.aliases) { 
						bot.aliases.set(alias, command.name);
					}
				}
				message.channel.send(`The command ${commandName} was reloaded.`);
			} catch(err) {
				message.channel.send(`An error has occurred: \`${err}\``);
			}
		}
	},
	class ReloadFileCommand extends Command {
		constructor() {
			super({
				name: "reloadfile",
				description: "Reload a file.",
				allowDMs: true,
				args: [
					{
						num: Infinity,
						type: "string"
					}
				],
				cooldown: {
					time: 0,
					type: "user"
				},
				hidden: true,
				perms: {
					bot: [],
					user: [],
					level: 5
				},
				usage: "reloadfile <file path>"
			});
		}
		
		async run(bot, message, args, flags) {
			try {
				let res = delete require.cache[require.resolve(`../${args[0]}`)];
				if (res) {
					message.channel.send(`The file ${args[0]} was reloaded and its require.cache has been cleared.`);
				} else {
					message.channel.send("Failed to reload that file.");
				}
			} catch(err) {
				message.channel.send(`Couldn't reload file: \`${err}\``);
			}
		}
	},
	class RestartCommand extends Command {
		constructor() {
			super({
				name: "restart",
				description: "Restarts the bot",
				aliases: ["reboot"],
				allowDMs: true,
				cooldown: {
					time: 0,
					type: "user"
				},
				hidden: true,
				perms: {
					bot: [],
					user: [],
					level: 4
				}
			});
		}
		
		async run(bot, message, args, flags) {
			message.channel.send("Restarting the bot in 10 seconds...");
			bot.logStats();
			setTimeout(() => {
				bot.destroy();
				process.exit(1);
			}, 10000)
		}
	},
	class StatsCommand extends Command {
		constructor() {
			super({
				name: "stats",
				description: "Get detailed stats for the Kendra bot",
				aliases: ["botstats"],
				allowDMs: true,
				cooldown: {
					time: 120000,
					type: "guild"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				},
				startTyping: true
			});
		}
		
		async run(bot, message, args, flags) {
			let beginEval = new Date();
			let serverCount = bot.guilds.size;
			let bigServerCount = bot.guilds.filter(g => g.large).size;
			let userCount = bot.users.size;
			let onlineUserCount = bot.users.filter(u => u.presence.status != "offline").size;
			let textChannelCount = bot.channels.filter(chnl => chnl.type == "text").size;
			let voiceChannelCount = bot.channels.filter(chnl => chnl.type == "voice").size;
			let categoryCount = bot.channels.filter(chnl => chnl.type == "category").size;
			let sessionMessages = bot.cache.stats.messageCurrentTotal + bot.cache.stats.messageSessionTotal;
			let totalMessages = stats.messageTotal + bot.cache.stats.messageCurrentTotal;
			let sessionCalls = bot.cache.stats.callCurrentTotal + bot.cache.stats.callSessionTotal
			let totalCalls = stats.callTotal + bot.cache.stats.callCurrentTotal;
			let commandCurrentTotal = bot.cache.stats.commandCurrentTotal;
			for (let i = 0; i < bot.cache.stats.commandUsage.length; i++) {
				commandCurrentTotal += bot.cache.stats.commandUsage[i].uses;
			}
			let sessionCommands = commandCurrentTotal + bot.cache.stats.commandSessionTotal;
			let totalCommands = stats.commandTotal + commandCurrentTotal;
			let endEval = new Date();
			message.channel.send(new Discord.RichEmbed()
			.setAuthor(`Kendra Bot Stats`, bot.user.avatarURL)
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter(`⏰ Took: ${((endEval - beginEval) / 1000).toFixed(2)}s | Stats as of`)
			.setTimestamp(message.createdAt)
			.setDescription("Here's some detailed stats about the Kendra bot!")
			.addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1048576).toFixed(2)} MB`, true)
			.addField("Last Restart", getDuration(bot.readyTimestamp), true)
			.addField("Servers", 
			`Total: ${serverCount.toLocaleString()}` + `\n` +
			`Large: ${bigServerCount.toLocaleString()} (${(bigServerCount * 100 / serverCount).toFixed(1)}%)`
			, true)
			.addField("Users", 
			`Total: ${userCount.toLocaleString()} (${(userCount / serverCount).toFixed(1)}/server)` + `\n` +
			`Online: ${onlineUserCount.toLocaleString()} (${(onlineUserCount / userCount * 100).toFixed(1)}%)`
			, true)
			.addField("Channels", 
			`Text: ${textChannelCount.toLocaleString()} (${(textChannelCount / serverCount).toFixed(2)}/server)` + `\n` +
			`Voice: ${voiceChannelCount.toLocaleString()} (${(voiceChannelCount / serverCount).toFixed(2)}/server)` + `\n` +
			`Categories: ${categoryCount.toLocaleString()} (${(categoryCount / serverCount).toFixed(2)}/server)`
			, true)
			.addField("Messages Seen",
			`Session: ${sessionMessages.toLocaleString()} (${this.setRate(sessionMessages, Number(new Date()) - bot.readyTimestamp)})` + `\n` +
			`Total: ${totalMessages.toLocaleString()} (${this.setRate(totalMessages, stats.duration)})`
			, true)
			.addField("Phone Calls Made",
			`Session: ${sessionCalls.toLocaleString()} (${this.setRate(sessionCalls, Number(new Date()) - bot.readyTimestamp)})` + `\n` +
			`Total: ${totalCalls.toLocaleString()} (${this.setRate(totalCalls, stats.duration)})`
			, true)
			.addField("Commands",
			`Session: ${sessionCommands.toLocaleString()} (${this.setRate(sessionCommands, Number(new Date()) - bot.readyTimestamp)})` + "\n" +
			`Total: ${totalCommands.toLocaleString()} (${this.setRate(totalCommands, stats.duration)})`
			, true)
			)
		}
		
		/*
			Others found:
			Bot Author, Shard Number, RAM Usage, Shard Uptime,
			
			Ratios, Min, Max, Average,:
			Pct Online/Guild
			Music Listeners/Guild
			ML Pct/Guild
			Music Connections/Guild
			Queue Size
			Being the only bot in a server
		*/
		
		setRate(amount, duration) {
			let amtPerDay = amount / duration * 8.64e+7;
			if (amtPerDay > 43200) {
				return `${(amtPerDay/86400).toFixed(2)}/sec`;
			} else if (amtPerDay > 720) {
				return `${(amtPerDay/1440).toFixed(2)}/min`;
			} else if (amtPerDay > 12) {
				return `${(amtPerDay/24).toFixed(2)}/hr`;
			} else {
				return `${amtPerDay.toFixed(2)}/day`;
			}		
		}
	},
	class SuggestCommand extends Command {
		constructor() {
			super({
				name: "suggest",
				description: "Suggest new features for the bot, or report problems",
				aliases: ["feedback", "complain", "report"],
				allowDMs: true,
				args: [
					{
						errorMsg: "You must provide a suggestion or problem to send to the official bot server.",
						num: Infinity,
						type: "string"
					}
				],
				cooldown: {
					time: 30000,
					type: "user"
				},
				usage: "suggest <suggestion>"
			});
		}
		
		async run(bot, message, args, flags) {
			bot.ideaWebhook.send({
				embeds: [{
					author: {
						name: message.author.tag,
						icon_url: message.author.avatarURL
					},
					color: Math.floor(Math.random() * 16777216),
					footer: {
						text: `#${message.channel.name} (ID ${message.channel.id}) in ${message.guild.name} (ID ${message.guild.id})`,
						timestamp: message.createdAt
					},
					description: args[0].replace(/https?\:\/\/\S+\.\S+/gi, "").replace(/(www\.)?(discord\.(gg|me|io)|discordapp\.com\/invite)\/[0-9a-z]+/gi, "")
				}]
			})
			.then(() => {
				message.channel.send("Your suggestion has been sent to the support server.");
			}).catch(err => {
				message.channel.send("Failed to send suggestion to support server.");
			})
		}
	},
	class UnloadCommand extends Command {
		constructor() {
			super({
				name: "unload",
				description: "Unloads a command. Some commands cannot be unloaded.",
				allowDMs: true,
				args: [
					{
						num: 1,
						type: "command"
					}
				],
				cooldown: {
					time: 0,
					type: "user"
				},
				hidden: true,
				perms: {
					bot: [],
					user: [],
					level: 5
				},
				usage: "unload <command>"
			});
		}
		
		async run(bot, message, args, flags) {
			let command = args[0];
			if (command.category == "Core" || command.name == "eval") return message.channel.send("That command is not unloadable.")
			delete require.cache[require.resolve(`./${command.category.toLowerCase().replace(/ /g, "-")}.js`)];
			bot.commands.delete(args[0]);
			message.channel.send(`The command ${command.name} was unloaded.`);
		}
	},
	class UsageCommand extends Command {
		constructor() {
			super({
				name: "usage",
				description: "Find out which commands on Kendra are used most often",
				aliases: ["popular", "mostused"],
				allowDMs: true,
				args: [
					{
						num: 1,
						optional: true,
						type: "number",
						min: 1
					}
				],
				cooldown: {
					time: 30000,
					type: "guild"
				},
				perms: {
					bot: ["EMBED_LINKS", "MANAGE_MESSAGES"],
					user: [],
					level: 0
				},
				usage: "k,usage [page]"
			});
		}
		
		async run(bot, message, args, flags) {
			let commandUsage = require("../modules/stats.json").commandDistrib;
			commandUsage.sort((a,b) => b.uses - a.uses);
			let entries = [commandUsage.map(cmd => `${cmd.command} - used ${cmd.uses} times`)];
			paginator.paginate(message, {title: "Most Popular Bot Commands"}, entries, {
				limit: 20,
				noStop: true,
				numbered: true,
				page: args[0] ? args[0] : 1,
				params: null
			});
		}
	}
];