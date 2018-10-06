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
				level: 8,
			},
			usage: "eval <code>"
		});
	}
	
	async run(bot, message, args, flags) {
		let res, beginEval, endEval;
		try {
			beginEval = Number(new Date());
			res = eval(args[0]);
			endEval = Number(new Date());
		} catch (err) {
			endEval = Number(new Date());
			res = `${err.stack.split("    ", 3).join("    ")}    ...`;
		};
		if (flags.find(f => f.name == "console")) {
			if (typeof res == "function") res = res.toString();
			console.log(res);
			message.react("✅");
		} else {
			let toEval = args[0].length < 1000 ? args[0] : args[0].slice(0,1000);
			if (res != undefined && res != null && res.toString().length > 1000) {
				res = `${res.toString().slice(0,1000)}...`
			};
			message.channel.send(new Discord.RichEmbed()
			.setTitle("discord.js Evaluator")
			.setColor(Math.floor(Math.random() * 16777216))
			.setTimestamp(message.createdAt)
			.setFooter(`Execution took: ${endEval - beginEval}ms`)
			.addField("Your code", "```javascript" + "\n" + toEval + "```")
			.addField("Result", "```javascript" + "\n" + res + "```")
			);
		}
	}
}

module.exports = EvalCommand;