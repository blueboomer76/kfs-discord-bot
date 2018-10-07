const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class AddRoleCommand extends Command {
	constructor() {
		super({
			name: "addrole",
			description: "Adds a role to a user. It will be logged if a modlog channel was set",
			aliases: ["ar", "giverole", "setrole"],
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
					desc: "Role to give",
					arg: {
						num: 1,
						type: "role"
					}
				},
				{
					name: "user",
					desc: "User to give the role to",
					arg: {
						num: 1,
						type: "member"
					}
				}
			],
			perms: {
				bot: ["MANAGE_ROLES"],
				user: ["MANAGE_ROLES"],
				level: 0
			},
			usage: "addrole <user> <role>"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		let role = args[1];
		if (role.comparePositionTo(message.guild.me.highestRole) >= 0) return message.channel.send("I cannot add that role because its position is at or higher than mine.")
		await member.addRole(role)
		.then(message.channel.send(`✅ Role **${role.name}** has been added to **${member.user.tag}**.`))
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	}
}

module.exports = AddRoleCommand;