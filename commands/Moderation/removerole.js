const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class RemoveRoleCommand extends Command {
	constructor() {
		super({
			name: "removerole",
			description: "Removes a role a user has. It will be logged if a modlog channel was set",
			aliases: ["rr", "takerole"],
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
			flags: [
				{
					name: "role",
					arg: {
						num: 1,
						type: "role"
					}
				},
				{
					name: "user",
					arg: {
						num: 1,
						type: "member"
					}
				}
			],
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
		if (!member.roles.find("name", args[1].name)) {
			return message.channel.send("That member does not have the role you provided.");
		}
		await member.removeRole(role)
		.then(message.channel.send(`✅ Role **${role.name}** has been removed from **${member.user.tag}**.`))
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	}
}

module.exports = RemoveRoleCommand;