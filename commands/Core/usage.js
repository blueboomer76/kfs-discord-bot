const Command = require("../../structures/command.js");
const paginator = require("../../utils/paginator.js");

class UsageCommand extends Command {
	constructor() {
		super({
			name: "usage",
			description: "Find out which commands from the bot are used most often",
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

		let entries = [storedUsages.map(cmd => `${cmd.command} - used ${cmd.uses} times`)];
		paginator.paginate(message, {title: "Most Popular Bot Commands"}, entries, {
			limit: 20,
			numbered: true,
			page: args[0] ? args[0] : 1,
			params: null
		});
	}
}

module.exports = UsageCommand;
