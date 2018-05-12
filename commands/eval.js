const Discord = require("discord.js");
const config = require("../config.json");

module.exports.run = async (bot, message, args) => {
	if (config.ownerIDs.indexOf(message.author.id) == -1) return message.channel.send("This command is owner-only.");
	var argstext = args.join(" ");
	var result;
	try {
		result = eval(argstext);
	} catch (err) {
		result = err;
		if (err && err.stack) result = err.stack;
	}
	if (result != undefined && result != null) {
		var result2 = result.toString();
		if (result2.length > 1000) result = result2.slice(0, 1000) + "...";
	}
	var toEval = argstext;
	if (toEval.length > 1000) toEval = toEval.slice(0, 1000) + "...";
	message.channel.send(new Discord.RichEmbed()
	.setTitle("discord.js Evaluator")
	.setColor(Math.floor(Math.random() * 16777216))
	.setTimestamp(message.createdAt)
	.addField("Your code", "```" + toEval + "```")
	.addField("Result", "```" + result + "```")
	);
}

module.exports.help = {
	"name": "eval"
}
