const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const paginator = require("../../utils/paginator.js")

class RoleListCommand extends Command {
	constructor() {
		super({
			name: "rolelist",
			description: "Get the guild's roles",
			aliases: ["roles"],
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
			flags: [
				{
					name: "ordered",
					desc: "Whether the list should be ordered according to position"
				},
			],
			perms: {
				bot: ["EMBED_LINKS", "MANAGE_MESSAGES"],
				user: [],
				level: 0
			},
			usage: "rolelist [page] [--ordered]"
		});
	}
	
	async run(bot, message, args, flags) {
		let entries = message.guild.roles.array();
		let orderedFlag = flags.find(f => f.name == "ordered");
		if (orderedFlag) entries.sort((a,b) => b.position - a.position);	
		paginator.paginate(message, {title: `List of roles - ${message.guild.name}`}, [entries.map(role => role.name)], {
			limit: 20,
			numbered: orderedFlag ? true : false,
			page: args[0] ? args[0] : 1,
			params: null
		});
	}
}

module.exports = RoleListCommand;