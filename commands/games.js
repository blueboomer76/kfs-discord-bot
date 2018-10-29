const Command = require("../structures/command.js");

module.exports = [
	class FishyCommand extends Command {
		constructor() {
			super({
				name: "fishy",
				description: "Catch fish and other objects with a fishing pole!",
				aliases: ["fish"]
			});
		}
		
		async run(bot, message, args, flags) {
			let commonObjs = ["🔋", "🛒", "👞", "📎"];
			let uncommonObjs = ["🐠", "🐡", "🐢", "🦐"];
			let rareObjs = ["🦑", "🐙", "🐸"];
			
			let rand = Math.random(), fished;
			if (rand < 0.45) {
				fished = commonObjs[Math.floor(Math.random() * commonObjs.length)]
			} else if (rand < 0.75) {
				fished = "🐟"
			} else if (rand < 0.95) {
				fished = uncommonObjs[Math.floor(Math.random() * uncommonObjs.length)]
			} else {
				fished = rareObjs[Math.floor(Math.random() * rareObjs.length)]
			}
			
			message.channel.send(`🎣 You used a fishing pole and caught: ${fished}!`);
		}
	},
	class RPSCommand extends Command {
		constructor() {
			super({
				name: "rps",
				description: "Play Rock-Paper-Scissors with the bot!",
				aliases: ["rockpaperscissors"],
				args: [
					{
						type: "oneof",
						allowedValues: ["rock", "paper", "scissors"]
					}
				],
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
]
