const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Bot References")
	.setDescription("Exciting! Now you have the chance to spread the love!")
	.setColor(Math.floor(Math.random() * 16777216))
	.addField("Bot Invite", "[Go!](https://discordapp.com/oauth2/authorize?client_id=333058410465722368&permissions=405921878&scope=bot)")
	.addField("Support Server", "[Go!](https://discord.gg/yB8TvWU)")
	);
}

module.exports.config = {
	"aliases": [],
	"cooldown": {
		"waitTime": 30000,
		"type": "guild"
	},
	"guildOnly": false,
	"perms": {
		"level": 0,
		"reqEmbed": true,
		"reqPerms": null
	}
}

module.exports.help = {
	"name": "invite",
	"category": "Bot",
	"description": "Get info about inviting the bot, or joining the bot's server",
	"usage": "invite"
}
