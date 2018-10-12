const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class QuoteCommand extends Command {
	constructor() {
		super({
			name: "quote",
			description: "Makes a quote",
			args: [
				{
					allowQuotes: true,
					num: Infinity,
					type: "member"
				},
				{
					num: Infinity,
					type: "string"
				}
			],
			usage: "quote <user> <quote>"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		message.channel.send(new Discord.RichEmbed()
		.setAuthor(member.user.tag, member.user.avatarURL)
		.setColor(Math.floor(Math.random() * 16777216))
		.setDescription(args[1])
		)
	}
}

module.exports = QuoteCommand;