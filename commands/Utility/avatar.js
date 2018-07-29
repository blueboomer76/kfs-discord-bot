const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports = {
	run: async (bot, message, args) => {
		let member = args[0];
		if (!member) member = message.guild.member(message.author);
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Avatar - " + member.user.tag)
		.setColor(Math.floor(Math.random() * 16777216))
		.setImage(member.user.avatarURL)
		);
	},
	commandInfo: {
		aliases: ["profilepic", "pfp"],
		args: {
			allowQuotes: false,
			num: Infinity,
			optional: true,
			type: "user"
		},
		category: "Utility",
		cooldown: {
			time: 15000,
			type: "channel"
		},
		description: "Get a user's avatar",
		flags: null,
		guildOnly: true,
		name: "avatar",
		perms: {
			bot: null,
			user: null,
			level: 0,
		},
		usage: "avatar [user]"
	}
}