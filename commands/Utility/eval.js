const Discord = require("discord.js");
const config = require("../../config.json")

module.exports.run = async (bot, message, args) => {
	if (config.ownerIDs.indexOf(message.author.id) == -1) return message.reply("Access is denied!");
	var result;
	var eDate = new Date();
	var argstext = args.join(" ");
	try {result = eval(argstext);} catch (err) {result = err.stack};
	if ((result != undefined || result != null) && result.length > 200) {result = result.slice(0,200) + "..."};
	message.channel.send(new Discord.RichEmbed()
	.setTitle("discord.js Evaluator")
	.setColor(Math.floor(Math.random() * 16777216))
	.setTimestamp(eDate.toJSON())
	.setFooter("Kendra Beta")
	.addField("Your code", "```javascript" + "\n" + argstext + "```")
	.addField("Result", "```javascript" + "\n" + result + "```")
		);
}

module.exports.config = {
	"aliases": null,
	"cooldown": {
		"waitTime": 1000,
		"type": "global"
	},
	"guildOnly": false,
	"perms": {
		"level": 10,
		"reqPerms": null
	}
}

module.exports.help = {
	"name": "eval",
	"category": "Util",
	"description": "Evaluate JavaScript code. Only the bot owner(s) can access this command",
	"usage": "k,eval <code>"
}
