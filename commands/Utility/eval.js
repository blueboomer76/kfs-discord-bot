const Discord = require("discord.js");
const config = require("../../config.json")

module.exports = {
	run: async (bot, message, args, flags) => {
		if (config.ownerIDs.indexOf(message.author.id) == -1) return message.reply("Access is denied!");
		let result;
		let evalDate = new Date();
		let toEval = args.join(" ");
		try {result = eval(toEval);} catch (err) {result = err.stack};
		let consoleFlag = flags.find(f => f.name == "console")
		if (consoleFlag) {
			console.log(result);
			message.react("✅");
		} else {
			if ((result != undefined || result != null) && result.length > 200) {result = result.slice(0,200) + "..."};
			message.channel.send(new Discord.RichEmbed()
			.setTitle("discord.js Evaluator")
			.setColor(Math.floor(Math.random() * 16777216))
			.setTimestamp(evalDate.toJSON())
			.setFooter("From Kendra")
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
			bot: null,
			user: null,
			level: 8,
		},
		usage: "eval <code>"
	}
}