const Discord = require("discord.js");
const superagent = require("superagent");

module.exports.run = async (bot, message, args) => {
	let {body} = await superagent
	.get("http://aws.random.cat/meow");
	
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Here's your random cat!")
	.setColor(Math.floor(Math.random() * 16777216))
	.setFooter("From random.cat")
	.setImage(body.file)
	);
}

module.exports.config = {
	"aliases": null,
	"cooldown": {
		"waitTime": 15000,
		"type": "user"
	},
	"guildOnly": true,
	"perms": {
		"level": 0,
		"reqPerms": null
	}
}

module.exports.help = {
	"name": "cat",
	"category": "Fun",
	"description": "Get a random cat!",
	"usage": "cat"
}
