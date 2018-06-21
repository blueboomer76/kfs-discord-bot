const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Kendra's References")
	.setDescription("Exciting, huh? Now you have the chance to spread the love! uwu")
	.setColor(Math.floor(Math.random() * 16777216))
	.setFooter("Made by blueboomer#4939")
	.addField("Bot Invite", "[Go!](https://discordapp.com/api/oauth2/authorize?client_id=429807759144386572&permissions=403041398&scope=bot")
	.addField("Kendra's server", "[Go!](https://discord.gg/yB8TvWU)")
	.addField("Github", "[Go!](https://github.com/blueboomer76/KendraBot)")
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
		"reqPerms": null
	}
}

module.exports.help = {
	"name": "invite",
	"category": "Bot",
	"description": "Get info about inviting the bot, or joining the bot's server",
	"usage": "k,invite"
}