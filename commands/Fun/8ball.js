const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class EightBallCommand extends Command {
	constructor() {
		super({
			name: "8ball",
			description: "Ask the 8 ball a yes/no question and get an answer!",
			aliases: ["8b"],
			args: [
				{
					num: Infinity,
					type: "string"
				}
			],
			category: "Fun",
			guildOnly: true
		});
	}
	
	async run(bot, message, args, flags) {
		let magicmsgs = [
			"Certainly",
			"It is decidedly so",
			"Without a doubt",
			"Yes, definitely",
			"You may rely on it",
			"As I see it, yes",
			"Most likely",
			"Outlook good",
			"Sure",
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
		if (!args[0].match(/ +/g)) {
			message.channel.send(":8ball: You need to provide an actual question...");
		} else {
			message.channel.send(":8ball: " + magicmsgs[Math.floor(Math.random() * 20)]);
		}
	}
}

module.exports = EightBallCommand;