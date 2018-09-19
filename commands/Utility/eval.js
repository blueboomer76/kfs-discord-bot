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
					name: "console"
					desc: "Puts the result in the console"
				}
			],
			hidden: true,
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 8,
			},
			usage: "eval <code>"
		});
	}
	
	async run(bot, message, args, flags) {
		let result, beginEvalDate, endEvalDate;
		try {
			beginEvalDate = Number(new Date());
			result = eval(args[0]);
			endEvalDate = Number(new Date());
		} catch (err) {
			endEvalDate = Number(new Date());
			result = err
		};
		let consoleFlag = flags.find(f => f.name == "console")
		if (consoleFlag) {
			console.log(result);
			message.react("✅");
		} else {
			let evalDate = new Date();
			if ((result != undefined || result != null) && result.length > 500) {result = result.slice(0,500) + "..."};
			message.channel.send(new Discord.RichEmbed()
			.setTitle("discord.js Evaluator")
			.setColor(Math.floor(Math.random() * 16777216))
			.setTimestamp(message.createdAt)
			.setFooter(`Execution took: ${endEvalDate - beginEvalDate}ms`)
			.addField("Your code", "```javascript" + "\n" + args[0] + "```")
			.addField("Result", "```javascript" + "\n" + result + "```")
			);
		}
	}
}

module.exports = EvalCommand;