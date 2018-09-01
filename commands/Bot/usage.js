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
				bot: ["EMBED_LINKS", "MANAGE_MESSAGES"],
				user: [],
				level: 0
			},
			usage: "k,usage [page]"
		});
	}
	
	async run(bot, message, args, flags) {
		let startPage;
		if (!args[0]) {startPage = 1;} else {startPage = args[0];}
		let stats = require("../../modules/stats.json");
		let commandUsage = stats.commandDistrib;
		commandUsage.sort((a,b) => b.uses - a.uses);
		let entries = [commandUsage.map(cmd => `${cmd.command} - used ${cmd.uses} times`)];
		let usageEmbed = paginator.generateEmbed(startPage, entries, 20, null)
		usageEmbed.title = "Most Popular Commands on Kendra";
		message.channel.send("", {embed: usageEmbed})
		.then(newMessage => {
			if (entries[0].length > 20) {
				paginator.addPgCollector(message, newMessage, entries, 20, null)
			}
		})
	}
}

module.exports = UsageCommand;