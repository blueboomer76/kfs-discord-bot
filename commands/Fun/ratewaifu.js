const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class RateWaifuCommand extends Command {
	constructor() {
		super({
			name: "ratewaifu",
			description: "Have the bot rate someone for you",
			aliases: ["opinion", "rate"],
			args: [
				{
					num: Infinity,
					type: "string"
				}
			],
			usage: "ratewaifu <someone>"
		});
	}
	
	async run(bot, message, args, flags) {
		let hash = 0;
		let memberRegex = /<@!?\d+>/;
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
		let rand = (Math.abs(hash % 90 / 10) + 1).toFixed(1), toSend;
		if (args[0].toLowerCase == "kendra" || message.mentions.users.first() == bot.user) {
			toSend = "I would rate myself a 10/10";
		} else if (message.mentions.users.first() == message.author || args[0] == message.author.tag) {
			rand = (Math.abs(hash % 50 / 10) + 5).toFixed(1);
			toSend = `I would rate you a ${rand}/10`
		} else {
			toSend = `I would rate **${args[0]}** a ${rand}/10`
		}
		message.channel.send(toSend);
	}
}

module.exports = RateWaifuCommand;