const {MessageEmbed, Formatters, version} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	{getDateAndDurationString, getBotStats, getDuration} = require("../../modules/functions.js"),
	Paginator = require("../../utils/paginator.js"),
	packageInfo = require("../../package.json"),
	os = require("os");

const subcommands = [
	class BotInfoSubcommand extends Command {
		constructor() {
			super({
				name: "info",
				description: "General bot information",
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

		async run(ctx) {
			const userSuffix = ctx.bot.intents.has(["GUILD_MEMBERS", "GUILD_PRESENCES"]) ? "Users" : "Active Users";

			ctx.respond(new MessageEmbed()
				.setAuthor({name: "About this bot", authorURL: ctx.bot.user.avatarURL({format: "png"})})
				.setDescription("A multipurpose Discord bot for fun, moderation, utility, and more. " +
					"It has a phone command for connecting other servers together, and combines features from popular bots.")
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter({text: "Bot ID: " + ctx.bot.user.id})
				.addField("Node.js Version", process.version.slice(1), true)
				.addField("Discord.js Library Ver.", version, true)
				.addField("Bot Version", packageInfo.version, true)
				.addField("Bot Created", Formatters.time(ctx.bot.user.createdTimestamp, "R"), true)
				.addField("Quick Stats", ctx.bot.cache.guildCount + " Servers\n" + ctx.bot.cache.userCount + ` ${userSuffix}\n` +
					ctx.bot.cache.channelCount + " Channels", true)
				.addField("Bot Invite",
					`[Go!](https://discord.com/oauth2/authorize?client_id=${ctx.bot.user.id}&permissions=405921878&scope=bot)`, true)
				.addField("Support Server", "[Go!](https://disboard.org/servers/308063187696091140)", true)
				.addField("Upvote this bot", "discordbots.org: [Go!](https://discordbots.org/bots/333058410465722368/vote)\n" +
					"bots.ondiscord.xyz: [Go!](https://bots.ondiscord.xyz/bots/333058410465722368)\n" +
					"botsfordiscord.com: [Go!](https://botsfordiscord.com/bots/333058410465722368/vote)", true)
			);
		}
	},
	class StatsSubcommand extends Command {
		constructor() {
			super({
				name: "stats",
				description: "Detailed bot stats",
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

		async run(ctx) {
			const beginEval = Date.now(),
				botStats = getBotStats(ctx.bot),
				endEval = Date.now(),
				ms = endEval - beginEval,
				evalTime = ms < 1000 ? ms + "ms" : (ms / 1000).toFixed(2) + "s",
				processUptime = process.uptime() * 1000,
				duration = ctx.bot.cache.cumulativeStats.duration + (Date.now() - ctx.bot.cache.stats.lastCheck),
				serverCount = botStats.servers,
				userCount = botStats.users;

			const statsEmbed = new MessageEmbed()
				.setAuthor({name: "Bot Stats", authorURL: ctx.bot.user.avatarURL({format: "png"})})
				.setFooter({text: "⏰ Took: " + evalTime + " | Stats as of"})
				.setDescription("Here's some detailed stats about this bot! *To see stats about the bot host, use `/bot processor`*")
				.setColor(Math.floor(Math.random() * 16777216))
				.setTimestamp(ctx.interaction.createdAt)
				.addField("Bot Created", getDateAndDurationString(ctx.bot.user.createdTimestamp), true)
				.addField("Bot Last Ready", getDateAndDurationString(ctx.bot.readyTimestamp), true)
				.addField("Servers",
					"Total: " + serverCount.toLocaleString() + "\n" +
					"Large: " + botStats.largeServers.toLocaleString() + ` (${(botStats.largeServers * 100 / serverCount).toFixed(1)}%)`,
					true);

			const userFieldName = ctx.bot.intents.has("GUILD_MEMBERS") ? "Users" : "Active Users";
			if (ctx.bot.intents.has("GUILD_PRESENCES")) {
				statsEmbed.addField(userFieldName,
					"Total: " + userCount.toLocaleString() + ` (${(userCount / serverCount).toFixed(1)}/server)\n` +
					"Online: " + botStats.statuses.online.toLocaleString() + ` (${(botStats.statuses.online / userCount * 100).toFixed(1)}%)`,
					true);
			} else {
				statsEmbed.addField(userFieldName, "Total: " + userCount.toLocaleString() + ` (${(userCount / serverCount).toFixed(2)}/server)`, true);
			}

			statsEmbed
				.addField("Channels",
					"Text: " + botStats.channels.text.toLocaleString() +
						` (${(botStats.channels.text / serverCount).toFixed(2)}/server)\n` +
					"Voice: " + botStats.channels.voice.toLocaleString() +
						` (${(botStats.channels.voice / serverCount).toFixed(2)}/server)\n` +
					"Categories: " + botStats.channels.categories.toLocaleString() +
						` (${(botStats.channels.categories / serverCount).toFixed(2)}/server)`,
					true)
				.addField("Commands",
					"Session: " + botStats.sessionCommands.toLocaleString() +
						` (${this.getUnitRateString(botStats.sessionCommands, processUptime)})\n` +
					"Total: " + botStats.totalCommands.toLocaleString() +
						` (${this.getUnitRateString(botStats.totalCommands, duration)})`,
					true)
				.addField("Phone Connections",
					"Session: " + botStats.sessionCalls.toLocaleString() +
						` (${this.getUnitRateString(botStats.sessionCalls, processUptime)})\n` +
					"Total: " + botStats.totalCalls.toLocaleString() +
						` (${this.getUnitRateString(botStats.totalCalls, duration)})`,
					true);

			ctx.respond(statsEmbed);
		}

		getUnitRateString(amount, duration) {
			const amtPerDay = amount / duration * 8.64e+7;
			if (amtPerDay > 43200) {
				return (amtPerDay / 86400).toFixed(2) + "/sec";
			} else if (amtPerDay > 720) {
				return (amtPerDay / 1440).toFixed(2) + "/min";
			} else if (amtPerDay > 12) {
				return (amtPerDay / 24).toFixed(2) + "/hr";
			} else {
				return amtPerDay.toFixed(2) + "/day";
			}
		}
	},
	class ProcessorSubcommand extends Command {
		constructor() {
			super({
				name: "processor",
				description: "Bot processor stats",
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

		async run(ctx) {
			const totalMemory = os.totalmem(),
				freeMemory = os.freemem(),
				usedMemory = totalMemory - freeMemory,
				processUsedMemory = process.memoryUsage(),
				heapTotal = processUsedMemory.heapTotal,
				heapUsed = processUsedMemory.heapUsed,
				cpuUsage1 = this.getCpuUsage(os.cpus());

			const statsEmbed = new MessageEmbed()
				.setAuthor({name: "Bot Stats - Processor", authorURL: ctx.bot.user.avatarURL({format: "png"})})
				.setDescription("Here's some detailed stats about the host that this bot is on!")
				.setColor(Math.floor(Math.random() * 16777216))
				.setTimestamp(ctx.interaction.createdAt)
				.addField("Process Started", getDuration(Date.now() - process.uptime() * 1000), true)
				.addField("Total Resident Set (RSS)", this.getMemoryString(processUsedMemory.rss), true)
				.addField("Heap Usage", `Total: ${this.getMemoryString(heapTotal)}\n` +
					`Used: ${this.getMemoryString(heapUsed)} (${(heapUsed / heapTotal * 100).toFixed(1)}%)`, true)
				.addField("Memory", `Total: ${this.getMemoryString(totalMemory)}\n` +
					`Used: ${this.getMemoryString(usedMemory)} (${(usedMemory / totalMemory * 100).toFixed(1)}%)\n` +
					`Free: ${this.getMemoryString(freeMemory)} (${(freeMemory / totalMemory * 100).toFixed(1)}%)`, true);

			setTimeout(() => {
				const cpus = os.cpus(), cpuUsage2 = this.getCpuUsage(cpus);
				let totalUsage = 0;
				for (let i = 0; i < cpuUsage1.length; i++) {
					const idleDif = cpuUsage2[i].idle - cpuUsage1[i].idle, nonidleDif = cpuUsage2[i].nonidle - cpuUsage1[i].nonidle;
					totalUsage += nonidleDif / (idleDif + nonidleDif);
				}

				statsEmbed.addField("CPU Usage", (totalUsage / cpuUsage1.length * 100).toFixed(1) + "%", true)
					.addField("Processor", cpus[0].model)
					.addField("Processors Utilized", cpuUsage1.length.toString());

				ctx.respond(statsEmbed);
			}, 250);
		}

		getMemoryString(bytes) {
			if (bytes < Math.pow(2, 30)) {
				return (bytes / Math.pow(2, 20)).toFixed(2) + " MB";
			} else if (bytes < Math.pow(2, 40)) {
				return (bytes / Math.pow(2, 30)).toFixed(2) + " GB";
			} else {
				return (bytes / Math.pow(2, 40)).toFixed(2) + " TB";
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
	class UsageSubcommand extends Command {
		constructor() {
			super({
				name: "usage",
				description: "Bot command usage counts",
				allowDMs: true,
				args: [
					{
						name: "command",
						description: "The slash command",
						type: "string",
						parsedType: "slashCommand",
						parsedTypeParams: {matchType: "whole"}
					}
				],
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

		async run(ctx) {
			const storedUsages = require("../../data/stats.json").slashCommandUsages,
				cmdNames = Object.keys(storedUsages),
				cmdUses = Object.values(storedUsages),
				tempArray = [];
			for (let i = 0; i < cmdNames.length; i++) {
				tempArray.push({name: cmdNames[i], uses: cmdUses[i]});
			}

			const command = ctx.parsedArgs["command"];
			if (!command) {
				tempArray.sort((a, b) => b.uses - a.uses);
				const entries = [tempArray.map(cmd => `${cmd.name} - used ${cmd.uses} times`)];

				new Paginator(ctx, entries, {title: "Most Popular Bot Commands"}, {
					noStop: true,
					numbered: true
				}).start();
			} else {
				let usagesIndex = cmdNames.indexOf(command.fullName);
				if (usagesIndex == -1) return ctx.respond("The command **" + command.fullName + "** has not been used yet.", {level: "warning"});

				tempArray.sort((a, b) => b.uses - a.uses);
				usagesIndex = cmdNames.indexOf(command.fullName);

				ctx.respond(`Command **${command.fullName}** has been used **${cmdUses[usagesIndex]}** times.\n` +
					`It is the #${usagesIndex + 1} most used command.`);
			}
		}
	}
];

class BotCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "bot",
			description: "Bot-related commands",
			subcommands: subcommands
		});
	}
}

module.exports = BotCommandGroup;
