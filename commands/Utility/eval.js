const Discord = require("discord.js");
const config = require("../../config.json");

module.exports = {
	run: async (bot, message, args, flags) => {
		if (config.ownerIDs.indexOf(message.author.id) == -1) return message.channel.send("This command has restricted access.");
		let consoleFlag = flags.find(f => f.name == "console");
		let toEval = args[0];
		let result;
		try {
			result = eval(toEval);
		} catch (err) {
			result = err;
			if (err && err.stack && !consoleFlag) result = err.stack;
		}

		if (consoleFlag) {
			if (typeof result == "function") result = result.toString();
			console.log(result);
			message.react("✅");
		} else {
			if (toEval.length > 1000) toEval = toEval.slice(0, 1000) + "...";
			if (result != undefined && result != null) {
				let result2 = result.toString();
				if (result2.length > 1000) result = result2.slice(0, 1000) + "...";
			}
			message.channel.send(new Discord.RichEmbed()
			.setTitle("discord.js Evaluator")
			.setColor(Math.floor(Math.random() * 16777216))
			.setTimestamp(message.createdAt)
			.addField("Your code", "```javascript" + "\n" + toEval + "```")
			.addField("Result", "```javascript" + "\n" + result + "```")
			);
		}
	},
	commandInfo: {
		aliases: ["exec"],
		args: [
			{
				allowQuotes: false,
				num: Infinity,
				optional: false,
				type: "string"
			}
		],
		category: "Utility",
		cooldown: {
			time: 0,
			type: "global"
		},
		description: "Evaluate JavaScript code. Only the bot owner(s) can access this command",
		flags: [
			{
				name: "console",
				argsType: null
			}
		],
		guildOnly: false,
		name: "eval",
		perms: {
			bot: ["EMBED_LINKS"],
			user: null,
			level: 8
		},
		usage: "eval <code>"
	}
}
