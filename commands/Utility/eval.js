const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class EvalCommand extends Command {
	constructor() {
		super({
			name: "eval",
			description: "Evaluate JavaScript code",
			args: [
				{
					num: Infinity,
					type: "string"
				}
			],
			category: "Utility",
			cooldown: {
				time: 0,
				type: "user"
			},
			flags: [
				{
					name: "console"
				}
			],
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 8,
			},
			usage: "eval <code>"
		});
	}
	
	async run(bot, message, args, flags) {
		let result;
		try {result = eval(args[0]);} catch (err) {result = err};
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
			.setTimestamp(evalDate.toJSON())
			.setFooter("From Kendra")
			.addField("Your code", "```javascript" + "\n" + args[0] + "```")
			.addField("Result", "```javascript" + "\n" + result + "```")
			);
		}
	}
}

module.exports = EvalCommand;