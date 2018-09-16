const Command = require("../../structures/command.js");

class RateCommand extends Command {
	constructor() {
		super({
			name: "rate",
			description: "Have the bot rate someone or something for you",
			args: [
				{
					num: Infinity,
					type: "string"
				}
			],
			guildOnly: true,
			usage: "rate <someone or something>"
		});
	}
	
	async run(bot, message, args, flags) {
		let hash = 0;
		let memberRegex = /^<@!?\d{17,19}>$/;
		if (memberRegex.test(args[0])) {
			let memberRegex2 = /\d+/;
			let member = message.guild.members.get(args[0].match(memberRegex2)[0])
			args[0] = member ? member.user.tag : args[0];
		}
		for (let i = 0; i < args[0].length; i++) {
			let c = args[0].charCodeAt(i);
			hash = hash * 31 + c;
			hash |= 0; // Convert to 32-bit integer
		}
		let rand = (Math.abs(hash % 90 / 10) + 1).toFixed(1);
		let toSend;
		if (args[0].toLowerCase() == bot.user.username.toLowerCase() || args[0] == bot.user.tag) {
			toSend = "I would rate myself a 10/10";
		} else if (args[0] == message.author.tag || args[0].toLowerCase() == "me") {
			rand = (Math.abs(hash % 50 / 10) + 5).toFixed(1);
			toSend = `I would rate you a ${rand}/10`;
		} else {
			let toRate = args[0];
			if (toRate.length > 1500) toRate = toRate.slice(0, 1500) + "...";
			toSend = `I would rate **${toRate}** a ${rand}/10`;
		}
		message.channel.send(toSend);
	}
}

module.exports = RateCommand;
