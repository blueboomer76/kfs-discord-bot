const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class ChooseCommand extends Command {
	constructor() {
		super({
			name: "choose",
			description: "Have the bot choose among a list of items",
			args: [
				{
					allowQuotes: true,
					num: Infinity,
					parseSeperately: true,
					type: "string"
				}
			],
			category: "Fun",
			guildOnly: true,
			usage: "choose <choices...>"
		});
	}
	
	async run(bot, message, args, flags) {
		message.channel.send("I choose: " + args[Math.floor(Math.random() * args.length)]);
	}
}

module.exports = ChooseCommand;