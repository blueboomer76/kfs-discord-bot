const Command = require("../../structures/command.js");

class RemoveRoleCommand extends Command {
	constructor() {
		super({
			name: "removerole",
			description: "Removes a role a user has",
			aliases: ["takerole"],
			args: [
				{
					allowQuotes: true,
					num: Infinity,
					type: "member"
				},
				{
					num: Infinity,
					type: "role"
				}
			],
			cooldown: {
				time: 20000,
				type: "user"
			},
			guildOnly: true,
			perms: {
				bot: ["MANAGE_ROLES"],
				user: ["MANAGE_ROLES"],
				level: 1
			},
			usage: "removerole <user> <role>"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		let role = args[1];
		if (member.id == message.author.id || member.id == bot.user.id) return message.channel.send("This command cannot be used on yourself or the bot.");
		if (!member.roles.has(role.id)) return message.channel.send("The user does not have that role.");
		if (message.author.id != message.guild.owner.id && role.comparePositionTo(message.member.highestRole) >= 0) {
			return message.channel.send("Cannot remove role: your highest role must be higher than the role to remove");
		}
		member.removeRole(role)
		.then(() => message.channel.send(`✅ Role **${role.name}** has been removed from the user **${member.user.tag}**.`))
		.catch(() => message.channel.send("Could not remove the role from the user."))
	}
}

module.exports = RemoveRoleCommand;
