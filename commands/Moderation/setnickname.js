const Discord = require("discord.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		let member = args[0];
		let newNick = args[1];
		await member.setNickname(newNick)
		.then(message.channel.send(`✅ Nickname of **${member.user.tag}** has been set to **${newNick}.`))
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	},
	commandInfo: {
		aliases: ["changenick", "setnick"],
		args: [
			{
				allowQuotes: true,
				num: Infinity,
				optional: false,
				type: "user"
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
		description: "Changes a member's nickname. It will be logged if a modlog channel was set",
		flags: null,
		guildOnly: true,
		name: "setnickname",
		perms: {
			bot: ["MANAGE_NICKNAMES"],
			user: ["MANAGE_NICKNAMES"],
			level: 2,
		},
		usage: "setnickname <user> <new nick>"
	}
};