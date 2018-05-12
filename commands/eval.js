const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	if (config.ownerIDs.indexOf(message.author.id) == -1) return;
	var result;
	var d = new Date();
	var argstext = args.join(" ");
	try {result = eval(argstext);} catch (err) {result = err.stack;};
	if ((result != undefined || result != null) && result.length > 1000) {result = result.slice(0,1000) + "..."};
	message.channel.send(new Discord.RichEmbed({
		"title": "discord.js Evaluator",
		"color": Math.floor(Math.random() * 16777216),
		"timestamp": d.toJSON(),
		"footer": {
			"text": "Kendra Beta"
		},
		"fields": [
			{
				"name": "Your code",
				"value": "```" + argstext + "```"
			},
			{
				"name": "Result",
				"value": "```" + result + "```"
			}
		]
	}));
}

module.exports.help = {
	"name": "eval"
}
