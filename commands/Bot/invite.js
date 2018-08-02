const Discord = require("discord.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Kendra's References")
		.setDescription("Exciting, huh? Now you have the chance to spread the love! uwu")
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter("Made by blueboomer#4939")
		.addField("Bot Invite", "[Go!](https://discordapp.com/api/oauth2/authorize?client_id=429807759144386572&permissions=403041398&scope=bot)")
		.addField("Kendra's server", "[Go!](https://discord.gg/yB8TvWU)")
		.addField("Github", "[Go!](https://github.com/blueboomer76/KendraBot)")
		);
	},
	commandInfo: {
		aliases: [],
		args: null,
		category: "Bot",
		cooldown: {
			time: 30000,
			type: "guild"
		},
		description: "Get info about inviting the bot, joining the bot's server, or its references",
		flags: null,
		guildOnly: false,
		name: "invite",
		perms: {
			bot: ["EMBED_LINKS"],
			user: null,
			level: 0,
		},
		usage: "invite"
	}
}