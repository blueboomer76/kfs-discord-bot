const Discord = require("discord.js");
const Command = require("../structures/command.js");

module.exports = [
	class BlackjackCommand extends Command {
		constructor() {
			super({
				name: "blackjack",
				description: "Play blackjack with the bot!",
				aliases: ["bj"],
				cooldown: {
					time: 60000,
					type: "user"
				}
			});
		}
		
		async run(bot, message, args, flags) {
			let memberGame = message.member.bjGame,
				suits = ["♠", "♥", "♣", "♦"],
				values = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"],
				deck = [];
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 13; j++) {
					deck.push({suit: suits[i], value: values[j]})
				}
			}
			
			memberGame = {
				dealer: [this.drawFromDeck(deck)],
				player: [this.drawFromDeck(deck), this.drawFromDeck(deck)],
				deck: deck,
				message: message,
				botMessage: null
			}
			
			await message.channel.send(this.showGame(memberGame, "start"))
			.then(msg => memberGame.botMessage = msg);
			
			await this.awaitResponse(memberGame);
			
			delete message.member.bjGame;
		}
		
		drawFromDeck(deck) { 
			return deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
		}
		
		showGame(game, state) {
			let toDisplayDealer = game.dealer.map(card => `${card.value} ${card.suit}`).join(", "),
				toDisplayPlayer = game.player.map(card => `${card.value} ${card.suit}`).join(", "),
				dealerValue = this.getHandValue(game.dealer),
				playerValue = this.getHandValue(game.player),
				mystery = state != "end" ? ", ???" : "";
			
			toDisplayDealer = `Dealer: ${toDisplayDealer}${mystery} (value ${dealerValue})`;
			toDisplayPlayer = `Player: ${toDisplayPlayer} (value ${playerValue})`
			
			if (state == "start") {
				return `${toDisplayDealer}\n${toDisplayPlayer}\n\n` + 
				`Type \`stand\` to end your turn, or \`hit\` to draw another card.`
			} else if (state == "drawing") {
				if (game.botMessage.deleted) return;
				game.botMessage.edit(`${toDisplayDealer}\n${toDisplayPlayer}\n\n` + 
				`Type \`stand\` to end your turn, or \`hit\` to draw another card.`)
			} else {
				if (game.botMessage.deleted) return;
				
				let result = "Tied";
				if (playerValue > 21) {
					result = "BUST";
				} else if (dealerValue > 21) {
					result = "Dealer Bust"
				} else if (playerValue > dealerValue) {
					result = "Player wins";
				} else if (dealerValue > playerValue) {
					result = "Dealer wins";
				}
				
				game.botMessage.edit(`${toDisplayDealer}\n${toDisplayPlayer}\n\n${result}!`);
			}
		}
		
		getHandValue(hand) {
			let handValue = 0;
			for (const card of hand) {
				if (card.value == "A") {
					if (handValue > 10) {
						handValue++;
					} else {
						handValue += 11;
					}
				} else if (card.value == "K" || card.value == "Q" || card.value == "J") {
					handValue += 10;
				} else {
					handValue += card.value;
				}
			}
			return handValue;
		}
		
		async awaitResponse(game) {
			await game.message.channel.awaitMessages(msg => msg.author.id == game.message.author.id && (msg.content == "hit" || msg.content == "stand"), {
				max: 1,
				time: 20000,
				errors: ["time"]
			})
			.then(collected => {
				let cMsg = collected.array()[0].content;
				if (cMsg == "stand") {
					this.dealDealerCards(game);
				} else {
					game.player.push(this.drawFromDeck(game.deck))
					if (this.getHandValue(game.player) < 21) {
						this.showGame(game, "drawing");
						this.awaitResponse(game);
					} else {
						this.endGame(game, "end");
					}
				}
			})
			.catch(() => this.dealDealerCards(game))
		}
		
		dealDealerCards(game) {
			while (this.getHandValue(game.dealer) < 17) {
				game.dealer.push(this.drawFromDeck(game.deck))
			}
			this.endGame(game);
		}
		
		endGame(game) {this.showGame(game, "end")}
	},
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
						num: 1,
						type: "oneof",
						allowedValues: ["rock", "paper", "scissors"]
					}
				],
				usage: "rps <rock | paper | scissors>"
			});
		}
		
		async run(bot, message, args, flags) {
			let choices = ["rock", "paper", "scissors"],
				userChoice = args[0],
				botChoice = choices[Math.floor(Math.random() * 3)],
				msgSuffix;
			
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
	},
	class SlotsCommand extends Command {
		constructor() {
			super({
				name: "slots",
				description: "Play slots and try to get lucky!",
				aliases: ["slot"]
			});
		}
		
		async run(bot, message, args, flags) {
			let symbols = ["🍒", "💵", "💰", "💎", "🍊", "🍋", "🍐", "🍉", "🍇", ":seven:"],
				chosen = [];
			for (let i = 0; i < 9; i++) {
				chosen.push(symbols[Math.floor(Math.random() * symbols.length)])
			}
			
			let result = "lost...";
			if (chosen[3] == chosen[4] || chosen[3] == chosen[5] || chosen[4] == chosen[5]) {
				result = "matched 2 symbols!"
				if (chosen[3] == chosen[4] && chosen[3] == chosen[5] && chosen[4] == chosen[5]) {
					result = "matched 3 symbols!"
				}
				
			}
			
			message.channel.send(`**🎰 | Kendra Slots**\n` + 
			`------------------\n` +
			`${chosen[0]} : ${chosen[1]} : ${chosen[2]}\n\n` +
			`${chosen[3]} : ${chosen[4]} : ${chosen[5]} **<<<**\n\n` +
			`${chosen[6]} : ${chosen[7]} : ${chosen[8]}\n` +
			`------------------\n` +
			`You rolled the slots... and ${result}`);
		}
	}
]