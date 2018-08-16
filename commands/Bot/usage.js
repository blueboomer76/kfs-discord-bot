const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const paginator = require("../../utils/paginator.js");

class UsageCommand extends Command {
	constructor() {
		super({
			name: "usage",
			description: "Find out which commands on Kendra are used most often",
			aliases: ["popular", "mostused"],
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
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0,
			},
			usage: "k,usage [page]"
		});
		this.nextStatsCheck = 0;
	}
	
	async run(bot, message, args, flags) {
		let startPage;
		if (!args[0]) {startPage = 1;} else {startPage = args[0];}
		if (new Date() > this.nextStatsCheck) {
			this.nextStatsCheck = Number(new Date()) + 3600000;
			bot.logStats();
			await delete require.cache[require.resolve("../../modules/stats.json")]
			setTimeout(this.sendStats, 1000, message, startPage);
		} else {
			this.sendStats(message, startPage);
		}
	}
	
	async sendStats(message, startPage) {
		let stats = require("../../modules/stats.json");
		let commandUsage = stats.commandDistrib;
		commandUsage.sort((a,b) => b.uses - a.uses);
		let entries = commandUsage.map(cmd => cmd.command + " - used " + cmd.uses + " times");
		let usageEmbed = paginator.generateEmbed(startPage, entries, null, 20, null)
		message.channel.send(usageEmbed
		.setTitle("Most Popular Commands (Updated every hour)")
		)
		.then(newMessage => {
			if (entries.length > 20) {
				paginator.addPgCollector(message, newMessage, entries, null, 20, null)
			}
		})
	}
}

module.exports = UsageCommand;