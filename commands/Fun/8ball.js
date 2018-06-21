const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	var magicmsgs = [
		"It is certain",
		"It is decidedly so",
		"Without a doubt",
		"Yes, definitely",
		"You may rely on it",
		"As I see it, yes",
		"Most likely",
		"Outlook good",
		"Yes",
		"Signs point to yes",
		"Reply hazy, try again",
		"Ask again later",
		"Better not tell you now",
		"Cannot predict now",
		"Concentrate and ask again",
		"Don't count on it",
		"My reply is no",
		"My sources say no",
		"Outlook not so good",
		"Very doubtful"
	]
	// Others include Sure; no, baka; most likely; without a doubt; take a wild guess; you'll be the judge; yes; senpai, pls no; might be possible; no

	if (args == "") {
		message.channel.send(":8ball: You need to provide a question...");
	} else {
		var rand = Math.floor(Math.random() * 20);
		message.channel.send(":8ball: " + magicmsgs[rand]);
	}
}

module.exports.config = {
	"aliases": ["8b"],
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
	"name": "8ball",
	"category": "Fun",
	"description": "Ask the 8 ball a question and get an answer!",
	"usage": "k,8ball <question>"
}