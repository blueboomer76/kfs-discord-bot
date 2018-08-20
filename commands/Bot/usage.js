const Command = require("../../structures/command.js");
const paginator = require("../../utils/paginator.js");

class UsageCommand extends Command {
	constructor() {
		super({
			name: "usage",
			description: "Find out which commands from the bot are used most often",
			aliases: ["popular", "mostused"],
			args: [
				{
					num: 1,
					optional: true,
					type: "number",
					min: 1
				}
			],
			category: "Bot",
			cooldown: {
				time: 30000,
				type: "guild"
			},
			perms: {
				bot: ["ADD_REACTIONS", "EMBED_LINKS", "MANAGE_MESSAGES"],
				user: [],
				level: 0
			},
			usage: "usage [page]"
		});
	}
	
	async run(bot, message, args, flags) {
		let storedUsages = require("../../modules/stats.json").commandUsages;
		storedUsages.sort((a, b) => b.uses - a.uses);

		let startPage;
		if (!args[0]) {startPage = 1} else {startPage = args[0]}
		let entries = storedUsages.map(cmd => cmd.command + " - used " + cmd.uses + " times");
		let usageEmbed = paginator.generateEmbed(startPage, entries, null, 20, null);
		message.channel.send(usageEmbed
		.setTitle("Most Popular Bot Commands")
		)
		.then(newMessage => {
			if (entries.length > 20) {
				paginator.addPgCollector(message, newMessage, entries, null, 20);
			}
		})
	}
}

module.exports = UsageCommand;