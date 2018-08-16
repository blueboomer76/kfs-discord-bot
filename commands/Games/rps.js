const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class RPSCommand extends Command {
	constructor() {
		super({
			name: "rps",
			description: "Play Rock-Paper-Scissors with the bot!",
			aliases: ["rockpaperscissors"],
			args: [
				{
					num: 1,
					type: "oneof",
					allowedValues: ["rock", "paper", "scissors"]
				}
			],
			category: "Games",
			guildOnly: true,
			usage: "rps <rock | paper | scissors>"
		});
	}
	
	async run(bot, message, args, flags) {
		let choices = ["rock", "paper", "scissors"]
		let userChoice = args[0];
		let botChoice = choices[Math.floor(Math.random() * 3)];
		let msgSuffix;
		
		if (userChoice == botChoice) {
			msgSuffix = "The game is a tie"
		} else {
			let win = false;
			if (userChoice == "rock" && botChoice == "scissors") win = !win;
			if (userChoice == "paper" && botChoice == "rock") win = !win;
			if (userChoice == "scissors" && botChoice == "paper") win = !win;
			if (win) {msgSuffix = "You win"} else {msgSuffix = "The bot wins"};
		}
		message.channel.send(`You chose ${userChoice} and I choose ${botChoice}. ${msgSuffix}!`);
	}
}

module.exports = RPSCommand;