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
					parseSeparately: true,
					type: "string"
				}
			],
			usage: "choose <choices...>"
		});
	}
	
	async run(bot, message, args, flags) {
		if (args.length < 2) return message.channel.send("You need to provide at least two choices for me to pick from!");
		let choice = args[Math.floor(Math.random() * args.length)];
		if (choice.length > 1500) choice = choice.slice(0, 1500) + "...";
		message.channel.send(`I choose: ${choice}`);
	}
}

module.exports = ChooseCommand;
