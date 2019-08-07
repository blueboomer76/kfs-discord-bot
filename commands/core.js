const {RichEmbed} = require("discord.js"),
	Command = require("../structures/command.js"),
	{capitalize, getBotStats, getDuration, parsePerm} = require("../modules/functions.js"),
	paginator = require("../utils/paginator.js"),
	packageInfo = require("../package.json"),
	fs = require("fs"),
	os = require("os");

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
			message.channel.send(new RichEmbed()
				.setAuthor("About this bot", bot.user.avatarURL)
				.setDescription("**Kendra Discord Bot** - an actively developed bot that not only has fun, moderation, utility commands, but a phone command for calling other servers, and combines features from popular bots. New commands are added to the bot often.")
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter(`Bot ID: ${bot.user.id}`)
				.addField("Library", `Discord.js v${packageInfo.dependencies["discord.js"].slice(1)}`, true)
				.addField("Bot Version", packageInfo.version, true)
				.addField("Bot created", getDuration(bot.user.createdTimestamp), true)
				.addField("Quick Stats", `${bot.cache.guildCount} Servers\n${bot.cache.userCount} Users\n${bot.cache.channelCount} Channels`, true)
				.addField("Bot Invite", `[Go!](https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&permissions=403041398&scope=bot)`, true)
				.addField("Kendra's server", "[Go!](https://discord.gg/yB8TvWU)", true)
				.addField("Upvote this bot", "Discordbots.org: [Go!](https://discordbots.org/bots/429807759144386572/vote)" + "\n" +
				"Botsfordiscord.com: [Go!](https://botsfordiscord.com/bots/429807759144386572/vote)" + "\n" +
				"Bots.ondiscord.xyz: [Go!](https://bots.ondiscord.xyz/bots/429807759144386572)", true)
			);
		}
	},
	class HelpCommand extends Command {
		constructor() {
			super({
				name: "help",
				description: "Get help for a command, or see all commands available.",
				allowDMs: true,
				cooldown: {
					time: 8000,
					type: "user"
				},
				flags: [
					{
						name: "dm",
						desc: "Sends the help message as a Direct Message instead"
					},
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				},
				subcommands: [
					{
						name: "arguments"
					},
					{
						name: "fallback",
						args: [
							{
								optional: true,
								type: "command"
							}
						]
					}
				],
				usage: "help [command] [--dm] OR help arguments"
			});
		}
		
		async run(bot, message, args, flags) {
			const helpEmbed = new RichEmbed().setColor(Math.floor(Math.random() * 16777216));
			if (args[0] == "arguments") {
				message.channel.send(helpEmbed.setTitle("Argument Info")
					.setDescription("Here's some argument info for commands:")
					.addField("Argument Legend", "In command usage strings:" + "\n" +
					"- Required argument (`<` and `>`) - needs to be provided for a command to work" + "\n" +
					"- Optional argument (`[` and `]`) - not needed for a command to work" + "\n" +
					"- Quotable argument (`arg | \"arg\"`) - can be quoted when more than one word is in an argument" + "\n" +
					"- Infinite arguments (`...`) - more than one argument can be provided" + "\n" +
					"- Key (`key:`) - represents the expected argument type" + "\n" +
					"*Arguments may be nested together in certain commands.*")
					.addField("Channels, Roles, and Users", "All of these can accept mentions, IDs or names." + "\n" +
					"*User arguments also accept nicknames.*")
					.addField("Images", "Images must be one of these forms:" + "\n" +
					"- Link to an image ending in .gif, .jpg, .jpeg, or .png" + "\n" +
					"- A user mention" + "\n" +
					"- An emoji (e.g. ⬆)" + "\n" +
					"*The bot will search through the last 25 messages for images if no arguments are given.*")
					.addField("Colors", "Colors must be in one of these forms:" + "\n" +
					"- Decimal (`decimal:number`), e.g. `decimal:1234567` [Range: `decimal:0`-`decimal:16777215`]" + "\n" +
					"- Hexadecimal (`#rrggbb` or `rrggbb`), e.g. `#112233` or `112233` [Range: `#000000`-`#ffffff`]" + "\n" +
					"- `rgb(r,g,b)`, e.g. `rgb(123,145,255)` [Range: `rgb(0,0,0)`-`rgb(255,255,255)`]" + "\n" +
					"- CSS color name, e.g. `blue`" + "\n" +
					"- `r,g,b`, e.g. `123,145,255` [Range: `0,0,0`-`255,255,255`]" + "\n" +
					"- `hsl(h,s,l)`, e.g. `hsl(123,45,67)` or `hsl(123,45%,67%)` [Range: `hsl(0,0,0)`-`hsl(359,100,100)`]")
				);
			} else {
				const command = args[0];
				if (!command) {
					let cmds = bot.commands;
					if (!bot.ownerIds.includes(message.author.id) && !bot.adminIds.includes(message.author.id)) {
						cmds = cmds.filter(cmd => !cmd.disabled && !cmd.hidden);
					}
					
					const cmdsByCat = {};
					for (const category of bot.categories) cmdsByCat[category] = [];
					for (const cmd of Array.from(cmds.values())) {
						cmdsByCat[cmd.category].push({n: cmd.name, c: cmd.category});
					}
					for (const cmdSet in cmdsByCat) {
						helpEmbed.addField(cmdsByCat[cmdSet][0].c, cmdsByCat[cmdSet].map(cmd => cmd.n).join(", "));
					}
					helpEmbed.setTitle("All the commands for this bot")
						.setDescription(`Use \`${bot.prefix}help <command>\` to get help for a command, e.g. \`${bot.prefix}help urban\`` + "\n" +
						"To see argument help, use `" + bot.prefix + "help arguments`")
						.setFooter(`There are ${cmds.size} commands available.`);
				} else {
					const commandFlags = command.flags.map(f => `\`--${f.name.toLowerCase()}\` (\`-${f.name.charAt(0)}\`): ${f.desc}`),
						commandPerms = command.perms,
						permReq = {
							bot: commandPerms.bot.length > 0 ? commandPerms.bot.map(p => parsePerm(p)).join(", ") : "None",
							user: commandPerms.user.length > 0 ? commandPerms.user.map(p => parsePerm(p)).join(", ") : "None",
							role: commandPerms.role ? `\nRequires having a role named ${commandPerms.role}.` : "",
							level: commandPerms.level > 0 ? `\nRequires being ${bot.permLevels[commandPerms.level].name}.` : ""
						};
					helpEmbed.setTitle(`Help - ${command.name}`)
						.setFooter(`Category: ${command.category} | Don't include the usage symbols when running the command.`)
						.addField("Description", command.description);
					if (command.aliases.length > 0) helpEmbed.addField("Aliases", command.aliases.join(", "));
					if (command.flags.length > 0) helpEmbed.addField("Options", commandFlags.join("\n"));
					helpEmbed.addField("Usage", "`" + bot.prefix + command.usage + "`");
					if (command.examples.length > 0) helpEmbed.addField("Examples", command.examples.map(e => "`" + e + "`").join("\n"));
					if (commandPerms.bot.length > 0 || commandPerms.user.length > 0 || commandPerms.role || commandPerms.level > 0) {
						helpEmbed.addField("Permissions", `Bot - ${permReq.bot}` + "\n" + `User - ${permReq.user}${permReq.role}${permReq.level}`);
					}
					helpEmbed.addField("Cooldown", command.cooldown.time != 0 ? `${command.cooldown.time / 1000} seconds per ${command.cooldown.type}` : "None");
				}
				if (flags.some(f => f.name == "dm")) {
					message.member.send(helpEmbed)
						.catch(() => message.channel.send("Failed to send a help message as a DM. Check your settings and try again."));
				} else {
					message.channel.send(helpEmbed);
				}
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
			message.channel.send(new RichEmbed()
				.setTitle("Kendra Bot References")
				.setDescription("Exciting! Use these links to spread the fun!")
				.setColor(Math.floor(Math.random() * 16777216))
				.addField("Bot Invite", `[Go!](https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&permissions=403041398&scope=bot)`, true)
				.addField("Kendra's server", "[Go!](https://discord.gg/yB8TvWU)", true)
				.addField("Upvote this bot", "Discordbots.org: [Go!](https://discordbots.org/bots/429807759144386572/vote)" + "\n" +
				"Botsfordiscord.com: [Go!](https://botsfordiscord.com/bots/429807759144386572/vote)" + "\n" +
				"Bots.ondiscord.xyz: [Go!](https://bots.ondiscord.xyz/bots/429807759144386572)", true)
				.addField("Github", "[Go!](https://github.com/blueboomer76/kendra-discord-bot)", true)
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
						infiniteArgs: true,
						type: "string",
						allowQuotes: true
					},
					{
						type: "string"
					},
					{
						optional: true,
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
				usage: "load <category | \"category\"> <command> [class name]"
			});
		}
		
		async run(bot, message, args, flags) {
			const category = args[0], commandName = args[1];
			
			if (bot.commands.has(commandName)) return {cmdErr: "A command with that name is already loaded."};
			try {
				const commandFile = category.toLowerCase().replace(/ /g, "-") + ".js",
					foundCmdFile = fs.existsSync("commands/advanced/" + commandFile) ? "./advanced/" + commandFile : "./" + commandFile;
				delete require.cache[require.resolve(foundCmdFile)];
				const commandClasses = require(foundCmdFile),
					CommandClass = commandClasses.find(c => c.name.toLowerCase().slice(0, c.name.length - 7) == (args[2] || args[1]));
				if (!CommandClass) return {cmdWarn: "Please provide a second argument for the full class name before \"Command\", replacing all numbers in the command with the word."};
				const newCommand = new CommandClass();
				newCommand.category = capitalize(category, true);
				bot.commands.set(commandName, newCommand);
				if (newCommand.aliases.length > 0) {
					for (const alias of newCommand.aliases) {bot.aliases.set(alias, newCommand.name)}
				}
				message.channel.send(`The command **${commandName}** was loaded.`);
			} catch(err) {
				return {cmdWarn: `A problem has occurred while trying to load the command **${commandName}**: \`${err}\``};
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
			const phoneCache = bot.cache.phone;
			await bot.checkDeletedPhoneChannels(bot);
			if (!phoneCache.channels.some(c => c.id == message.channel.id)) {
				phoneCache.channels.push(message.channel);
				if (phoneCache.channels.length == 1) {
					message.react("☎");
				} else {
					let phoneMsg0;
					bot.cache.stats.callCurrentTotal++;
					phoneCache.lastMsgTime = Date.now();
					phoneCache.timeout = setTimeout(bot.checkPhone, 1000*3600, bot);
					
					message.channel.send("☎ A phone connection has started! Greet the other side!");
					if (phoneCache.channels.length == 2) {
						phoneMsg0 = "The other side has picked up the phone! Greet the other side!";
					} else {
						phoneMsg0 = "Looks like someone else picked up the phone.";
						phoneCache.channels.shift().send("☎ Someone else is now using the phone...");
					}
					phoneCache.channels[0].send(`☎ ${phoneMsg0}`);
				}
			} else {
				let phoneMsg;
				if (phoneCache.channels.length == 1) {
					phoneMsg = "There was no response from the phone, hanging it up.";
				} else {
					const affected = message.channel.id == phoneCache.channels[0].id ? 1 : 0;
					phoneMsg = "You have hung up the phone.";
					phoneCache.channels[affected].send("☎ The other side hung up the phone.");
				}
				bot.resetPhone(bot);
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
			message.channel.send("Ping?")
				.then(msg => {
					msg.edit(`🏓 **Pong!**\nLatency: ${msg.createdTimestamp - message.createdTimestamp}ms\nAPI Latency: ${Math.round(bot.ping)}ms`);
				});
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
						type: "command"
					},
					{
						optional: true,
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
				usage: "reload <command> [command class name]"
			});
		}
		
		async run(bot, message, args, flags) {
			const command = args[0], commandName = command.name, category = command.category;
			try {
				const commandFile = category.toLowerCase().replace(/ /g, "-") + ".js",
					foundCmdFile = fs.existsSync("commands/advanced/" + commandFile) ? "./advanced/" + commandFile : "./" + commandFile;
				delete require.cache[require.resolve(foundCmdFile)];
				const commandClasses = require(foundCmdFile),
					CommandClass = commandClasses.find(c => c.name.toLowerCase().slice(0, c.name.length - 7) == (args[1] || args[0].name));
				if (!CommandClass) return {cmdWarn: "Please provide a second argument for the full class name before \"Command\", replacing all numbers in the command with the word."};
				const newCommand = new CommandClass();
				newCommand.category = category;
				bot.commands.set(commandName, newCommand);
				if (newCommand.aliases.length > 0) {
					const toRemoveAliases = bot.aliases.filter(alias => alias == commandName);
					for (const alias of toRemoveAliases.keys()) {
						bot.aliases.delete(alias);
					}
					for (const alias of newCommand.aliases) {
						bot.aliases.set(alias, newCommand.name);
					}
				}
				message.react("✅");
			} catch(err) {
				return {cmdWarn: `A problem has occurred while trying to reload the command: \`${err}\``};
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
						infiniteArgs: true,
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
				const res = delete require.cache[require.resolve(`../${args[0]}`)];
				message.channel.send(res ? "The file's require() cache has been cleared." : "Failed to reload that file.");
			} catch(err) {
				message.channel.send(`A problem has occurred while reloading the file: \`${err}\``);
			}
		}
	},
	class ShutdownCommand extends Command {
		constructor() {
			super({
				name: "shutdown",
				description: "Shuts down the bot and kills its process",
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
			await message.channel.send("Logging stats and shutting down the bot...");
			process.exit();
		}
	},
	class StatsCommand extends Command {
		constructor() {
			super({
				name: "stats",
				description: "Get detailed stats for this bot",
				aliases: ["botstats"],
				allowDMs: true,
				args: [
					{
						optional: true,
						shiftable: true,
						type: "oneof",
						allowedValues: ["processor"]
					}
				],
				cooldown: {
					time: 60000,
					type: "guild"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				},
				usage: "stats [processor]"
			});
		}
		
		async run(bot, message, args, flags) {
			const statsEmbed = new RichEmbed()
				.setColor(Math.floor(Math.random() * 16777216))
				.setTimestamp(message.createdAt);
			
			if (args[0] == "processor") {
				const totalMemory = os.totalmem(),
					freeMemory = os.freemem(),
					usedMemory = totalMemory - freeMemory,
					processUsedMemory = process.memoryUsage(),
					heapTotal = processUsedMemory.heapTotal,
					heapUsed = processUsedMemory.heapUsed,
					cpuUsage1 = this.getCpuUsage(os.cpus());
				
				statsEmbed.setAuthor("Bot Stats - Processor", bot.user.avatarURL)
					.setDescription("Here's some detailed stats about the host that this bot is on!")
					.addField("Process Started", getDuration(Date.now() - process.uptime() * 1000), true)
					.addField("Total Resident Set (RSS)", `${(processUsedMemory.rss / 1048576).toFixed(2)} MB`, true)
					.addField("Heap Usage", `Total: ${(heapTotal / 1048576).toFixed(2)} MB`+ "\n" +
					`Used: ${(heapUsed / 1048576).toFixed(2)} MB (${(heapUsed / heapTotal * 100).toFixed(1)}%)`, true)
					.addField("Memory", `Total: ${(totalMemory / 1073741824).toFixed(2)} GB` + "\n" +
					`Used: ${(usedMemory / 1073741824).toFixed(2)} GB (${(usedMemory / totalMemory * 100).toFixed(1)}%)` + "\n" +
					`Free: ${(freeMemory / 1073741824).toFixed(2)} GB (${(freeMemory / totalMemory * 100).toFixed(1)}%)`, true);
				
				setTimeout(() => {
					const cpus = os.cpus(), cpuUsage2 = this.getCpuUsage(cpus);
					let totalUsage = 0;
					for (let i = 0; i < cpuUsage1.length; i++) {
						const idleDif = cpuUsage2[i].idle - cpuUsage1[i].idle, nonidleDif = cpuUsage2[i].nonidle - cpuUsage1[i].nonidle;
						totalUsage += nonidleDif / (idleDif + nonidleDif);
					}
					
					statsEmbed.addField("CPU Usage", (totalUsage / cpuUsage1.length * 100).toFixed(1) + "%", true)
						.addField("Processor", cpus[0].model)
						.addField("Processors Utilized", cpuUsage1.length);
					message.channel.send(statsEmbed);
				}, 250);
			} else {
				const beginEval = Date.now(),
					botStats = getBotStats(bot),
					endEval = Date.now(),
					ms = endEval - beginEval,
					evalTime = ms < 1000 ? ms + "ms" : (ms / 1000).toFixed(2) + "s",
					processUptime = process.uptime() * 1000,
					serverCount = botStats.servers,
					userCount = botStats.users;
				
				statsEmbed.setAuthor("Bot Stats", bot.user.avatarURL)
					.setFooter(`⏰ Took: ${evalTime} | Stats as of`)
					.setDescription(`Here's some detailed stats about this bot! *To see stats about the bot host, use \`${bot.prefix}stats processor\`*`)
					.addField("Bot Created", getDuration(bot.user.createdTimestamp), true)
					.addField("Bot Last Ready", getDuration(bot.readyTimestamp), true)
					.addField("Servers", `Total: ${serverCount.toLocaleString()}` + "\n" +
					`Large: ${botStats.largeServers.toLocaleString()} (${(botStats.largeServers * 100 / serverCount).toFixed(1)}%)`
					, true)
					.addField("Users", `Total: ${userCount.toLocaleString()} (${(userCount / serverCount).toFixed(1)}/server)` + "\n" +
					`Online: ${botStats.presences.online.toLocaleString()} (${(botStats.presences.online / userCount * 100).toFixed(1)}%)`
					, true)
					.addField("Channels", `Text: ${botStats.channels.text.toLocaleString()} (${(botStats.channels.text / serverCount).toFixed(2)}/server)` + "\n" +
					`Voice: ${botStats.channels.voice.toLocaleString()} (${(botStats.channels.voice / serverCount).toFixed(2)}/server)` + "\n" +
					`Categories: ${botStats.channels.categories.toLocaleString()} (${(botStats.channels.categories / serverCount).toFixed(2)}/server)`
					, true)
					.addField("Messages Seen", `Session: ${botStats.sessionMessages.toLocaleString()} (${this.setRate(botStats.sessionMessages, processUptime)})` + "\n" +
					`Total: ${botStats.totalMessages.toLocaleString()} (${this.setRate(botStats.totalMessages, bot.cache.cumulativeStats.duration)})`
					, true)
					.addField("Phone Connections", `Session: ${botStats.sessionCalls.toLocaleString()} (${this.setRate(botStats.sessionCalls, processUptime)})` + "\n" +
					`Total: ${botStats.totalCalls.toLocaleString()} (${this.setRate(botStats.totalCalls, bot.cache.cumulativeStats.duration)})`
					, true)
					.addField("Commands", `Session: ${botStats.sessionCommands.toLocaleString()} (${this.setRate(botStats.sessionCommands, processUptime)})` + "\n" +
					`Total: ${botStats.totalCommands.toLocaleString()} (${this.setRate(botStats.totalCommands, bot.cache.cumulativeStats.duration)})`
					, true);
				message.channel.send(statsEmbed);
			}
		}
		
		setRate(amount, duration) {
			const amtPerDay = amount / duration * 8.64e+7;
			if (amtPerDay > 43200) {
				return (amtPerDay/86400).toFixed(2) + "/sec";
			} else if (amtPerDay > 720) {
				return (amtPerDay/1440).toFixed(2) + "/min";
			} else if (amtPerDay > 12) {
				return (amtPerDay/24).toFixed(2) + "/hr";
			} else {
				return amtPerDay.toFixed(2) + "/day";
			}		
		}

		getCpuUsage(cpus) {
			return cpus.map(cpu => {
				return {
					idle: cpu.times.idle,
					nonidle: Object.values(cpu.times).reduce((prev, val) => prev + val) - cpu.times.idle
				};
			});
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
						infiniteArgs: true,
						missingArgMsg: "You must provide a suggestion or problem to send to the official bot server.",
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
					description: args[0].replace(/https?:\/\/\S+\.\S+/gi, "").replace(/(www\.)?(discord\.(gg|me|io)|discordapp\.com\/invite)\/[0-9a-z]+/gi, "")
				}]
			})
				.then(() => {
					message.channel.send("✅ Your suggestion has been sent to the support server.");
				}).catch(() => {
					message.channel.send("⚠ Failed to send suggestion to support server.");
				});
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
			const command = args[0];
			if (command.category == "Core" || command.name == "eval") return {cmdErr: "That command is not unloadable."};
			bot.commands.delete(command.name);
			if (command.aliases.length > 0) {
				const toRemoveAliases = bot.aliases.filter(alias => alias == command.name);
				for (const alias of toRemoveAliases.keys()) bot.aliases.delete(alias);
			}
			message.channel.send(`The command **${command.name}** was unloaded.`);
		}
	},
	class UsageCommand extends Command {
		constructor() {
			super({
				name: "usage",
				description: "Find out which commands from the bot are used most often",
				aliases: ["popular", "mostused"],
				allowDMs: true,
				cooldown: {
					time: 30000,
					type: "guild"
				},
				flags: [
					{
						name: "current",
						desc: "Get most up to date usage for a command (only for 'command' subcommand)"
					}
				],
				perms: {
					bot: ["EMBED_LINKS", "MANAGE_MESSAGES"],
					user: [],
					level: 0
				},
				subcommands: [
					{
						name: "command",
						args: [
							{
								type: "command"
							}
						]
					},
					{
						name: "fallback",
						args: [
							{
								optional: true,
								type: "number",
								min: 1
							}
						]
					}
				],
				usage: "usage [page] OR usage command <command> [--current]"
			});
		}
		
		async run(bot, message, args, flags) {
			const distrib = bot.cache.cumulativeStats.commandDistrib,
				cmdNames = Object.keys(distrib),
				cmdUses = Object.values(distrib),
				tempArray = [];
			for (let i = 0; i < cmdNames.length; i++) {
				tempArray.push({name: cmdNames[i], uses: cmdUses[i]});
			}

			if (typeof args[0] == "number" || args[0] == null) {
				tempArray.sort((a, b) => b.uses - a.uses);
				const entries = [tempArray.map(cmd => `${cmd.name} - used ${cmd.uses} times`)];

				paginator.paginate(message, {title: "Most Popular Bot Commands"}, entries, {
					limit: 25,
					noStop: true,
					numbered: true,
					page: args[0] || 1,
					params: null
				});
			} else {
				const command = args[1];
				let distribIndex = cmdNames.indexOf(command.name);
				if (distribIndex == -1) return {cmdWarn: "The command **" + command.name + "** has not been used yet."};

				let cmdUsageEnd = "";
				if (flags.some(f => f.name == "current")) {
					tempArray.sort((a, b) => b.uses - a.uses);
					distribIndex = cmdNames.indexOf(command.name);
				} else {
					cmdUsageEnd = ", last updated " + getDuration(bot.cache.cumulativeStats.lastSorted);
				}
				
				message.channel.send(`Command **${command.name}** has been used **${cmdUses[distribIndex]}** times.` + "\n" +
				`It is the #${distribIndex + 1} most used command${cmdUsageEnd}.`);
			}
		}
	}
];