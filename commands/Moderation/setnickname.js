module.exports = {
	run: async (bot, message, args, flags) => {
		let member = args[0];
		let newNick = args[1];
		if (member.id == message.author.id || member.id == message.guild.owner.id || member.id == bot.user.id) return message.channel.send("This command cannot be used on yourself, the server owner, or the bot.");
		if (message.author.id != message.guild.owner.id && member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
			return message.channel.send("Cannot set nickname: your highest role must be higher than the user's highest role");
		}
		member.setNickname(newNick)
		.then(() => message.channel.send(`✅ Nickname of **${member.user.tag}** has been set to **${newNick}**.`))
		.catch(() => message.channel.send("Could not set the new nickname for the user."))
	},
	commandInfo: {
		aliases: ["changenick", "setnick"],
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
				type: "string"
			}
		],
		category: "Moderation",
		cooldown: {
			time: 20000,
			type: "user"
		},
		description: "Changes a user's nickname in this server",
		flags: null,
		guildOnly: true,
		name: "setnickname",
		perms: {
			bot: ["MANAGE_NICKNAMES"],
			user: ["MANAGE_NICKNAMES"],
			level: 2
		},
		usage: "setnickname <user> <new nickname>"
	}
};
