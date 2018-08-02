module.exports = {
	run: async (bot, message, args, flags) => {
		let member = args[0];
		let role = args[1];
		if (member.id == message.author.id || member.id == bot.user.id) return message.channel.send("This command cannot be used on yourself or the bot.");
		if (member.roles.get(role.id)) return message.channel.send("The user already has that role.");
		if (message.author.id != message.guild.owner.id && role.comparePositionTo(message.member.highestRole) >= 0) {
			return message.channel.send("Cannot add role: your highest role must be higher than the role to add");
		}
		member.addRole(role)
		.then(() => message.channel.send(`✅ Role **${role.name}** has been added to the user **${member.user.tag}**.`))
		.catch(() => message.channel.send("Could not add the role to the user."))
	},
	commandInfo: {
		aliases: ["giverole", "setrole"],
		args: [
			{
				allowQuotes: true,
				num: Infinity,
				optional: false,
				type: "member"
			},
			{
				allowQuotes: false,
				num: Infinity,
				optional: false,
				type: "role"
			}
		],
		category: "Moderation",
		cooldown: {
			time: 20000,
			type: "user"
		},
		description: "Adds a role to a user",
		flags: null,
		guildOnly: true,
		name: "addrole",
		perms: {
			bot: ["MANAGE_ROLES"],
			user: ["MANAGE_ROLES"],
			level: 2
		},
		usage: "addrole <user> <role>"
	}
};
