const Command = require("../../structures/command.js");
const paginator = require("../../utils/paginator.js")

class RoleListCommand extends Command {
	constructor() {
		super({
			name: "rolelist",
			description: "Get the server's roles",
			aliases: ["roles"],
			args: [
				{
					num: 1,
					optional: true,
					type: "number",
					min: 1
				}
			],
			category: "Utility",
			cooldown: {
				time: 30000,
				type: "guild"
			},
			guildOnly: true,
			perms: {
				bot: ["ADD_REACTIONS", "EMBED_LINKS", "MANAGE_MESSAGES"],
				user: [],
				level: 0
			},
			usage: "rolelist [page]"
		});
	}
	
	async run(bot, message, args, flags) {
		let startPage;
		if (!args[0]) {startPage = 1} else {startPage = args[0]}
		let roles = message.guild.roles.array();
		let entries = [];
		for (const role of roles) {entries.push(role.name);}
		let roleListEmbed = paginator.generateEmbed(startPage, entries, null, 20, null)
		message.channel.send(roleListEmbed
		.setTitle("List of roles - " + message.guild.name)
		)
		.then(newMessage => {
			if (entries.length > 20) {
				paginator.addPgCollector(message, newMessage, entries, null, 20)
			}
		})
	}
}

module.exports = RoleListCommand;
