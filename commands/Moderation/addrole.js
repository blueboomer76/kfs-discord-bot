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
			usage: "addrole <user> <role>"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		let role = args[1];
		if (role.comparePositionTo(message.guild.member(bot.user).highestRole) >= 0) return message.channel.send("I cannot add that role because it is higher than my role.")
		await member.addRole(role)
		.then(message.channel.send(`✅ Role **${role.name}** has been added to **${member.user.tag}**.`))
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	}
}

module.exports = AddRoleCommand;