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
			perms: {
				bot: ["EMBED_LINKS", "MANAGE_MESSAGES"],
				user: [],
				level: 0
			},
			usage: "rolelist [page]"
		});
	}
	
	async run(bot, message, args, flags) {
		let entries = [message.guild.roles.array().map(role => role.name)];
		let roleListEmbed = {
			title: `List of roles - ${message.guild.name}`
		};
		paginator.paginate(message, roleListEmbed, entries, {
			limit: 20,
			numbered: false,
			page: args[0] ? args[0] : 1,
			params: null
		});
	}
}

module.exports = RoleListCommand;