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
		if (args.length < 2) return message.channel.send("You need to provide at least two choices for me to pick from!");
		message.channel.send("I choose: " + args[Math.floor(Math.random() * args.length)]);
	}
}

module.exports = ChooseCommand;
