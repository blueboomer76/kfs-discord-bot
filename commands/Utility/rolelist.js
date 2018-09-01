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
				level: 0,
			},
			usage: "rolelist [page]"
		});
	}
	
	async run(bot, message, args, flags) {
		let startPage;
		if (!args[0]) {startPage = 1;} else {startPage = args[0];}
		let entries = [message.guild.roles.array().map(role => role.name)];
		let roleListEmbed = paginator.generateEmbed(startPage, entries, 20, null)
		roleListEmbed.title = `List of roles - ${message.guild.name}`
		message.channel.send("", {embed: roleListEmbed})
		.then(newMessage => {
			if (entries[0].length > 20) {
				paginator.addPgCollector(message, newMessage, entries, 20, null)
			}
		})
	}
}

module.exports = RoleListCommand;