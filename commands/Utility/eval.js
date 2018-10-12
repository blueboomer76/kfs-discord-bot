const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class EvalCommand extends Command {
	constructor() {
		super({
			name: "eval",
			description: "Evaluate JavaScript code",
			allowDMs: true,
			args: [
				{
					num: Infinity,
					type: "string"
				}
			],
			cooldown: {
				time: 0,
				type: "user"
			},
			flags: [
				{
					name: "console",
					desc: "Puts the result in the console"
				}
			],
			hidden: true,
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 5
			},
			usage: "eval <code> [--console]"
		});
	}
	
	async run(bot, message, args, flags) {
		let consoleFlag = flags.find(f => f.name == "console");
		let toEval = args[0];
		let result, beginEvalDate, endEvalDate;
		try {
			beginEvalDate = Number(new Date());
			result = eval(toEval);
		} catch (err) {
			result = err;
			if (err && err.stack && !consoleFlag) result = err.stack;
		} finally {
			endEvalDate = Number(new Date());
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
			.setFooter(`Execution took: ${endEvalDate - beginEvalDate}ms`)
			.setTimestamp(message.createdAt)
			.addField("Your code", "```javascript" + "\n" + toEval + "```")
			.addField("Result", "```javascript" + "\n" + result + "```")
			);
		}
	}
}

module.exports = EvalCommand;
