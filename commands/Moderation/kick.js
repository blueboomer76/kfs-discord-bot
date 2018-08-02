module.exports = {
	run: async (bot, message, args, flags) => {
		let member = args[0];
		if (member.id == message.author.id || member.id == message.guild.owner.id || member.id == bot.user.id) return message.channel.send("This command cannot be used on yourself, the server owner, or the bot.");
		if (message.author.id != message.guild.owner.id && member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
			return message.channel.send("Cannot kick: your highest role must be higher than the user's highest role");
		}
		member.kick()
		.then(() => message.channel.send(`✅ The user **${member.user.tag}** was kicked from the server.`))
		.catch(() => message.channel.send("Could not kick the user from the server."))
	},
	commandInfo: {
		aliases: [],
		args: [
			{
				allowQuotes: false,
				num: Infinity,
				optional: false,
				type: "member"
			}
		],
		category: "Moderation",
		cooldown: {
			time: 25000,
			type: "user"
		},
		description: "Kicks a user from this server",
		flags: null,
		guildOnly: true,
		name: "kick",
		perms: {
			bot: ["KICK_MEMBERS"],
			user: ["KICK_MEMBERS"],
			level: 2
		},
		usage: "kick <user>"
	}
};
