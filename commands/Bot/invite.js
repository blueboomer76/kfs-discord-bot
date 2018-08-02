const Discord = require("discord.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Bot References")
		.setDescription("Exciting! Now you have the chance to spread the love!")
		.setColor(Math.floor(Math.random() * 16777216))
		.addField("Bot Invite", "[Go!](https://discordapp.com/oauth2/authorize?client_id=333058410465722368&permissions=405921878&scope=bot)")
		.addField("Support Server", "[Go!](https://discord.gg/yB8TvWU)")
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
			level: 0
		},
		usage: "invite"
	}
}
