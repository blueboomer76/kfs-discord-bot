const Command = require("../structures/command.js"),
	request = require("request");

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
			const suits = ["♠", "♥", "♣", "♦"],
				values = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"],
				deck = [];
			let memberGame = message.member.bjGame;
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 13; j++) {
					deck.push({suit: suits[i], value: values[j]});
				}
			}

			memberGame = {
				dealer: [this.drawFromDeck(deck)],
				player: [this.drawFromDeck(deck), this.drawFromDeck(deck)],
				deck: deck,
				message: message,
				botMessage: null
			};

			await message.channel.send(this.showGame(memberGame, "start"))
				.then(msg => memberGame.botMessage = msg);

			await this.awaitResponse(memberGame);

			delete message.member.bjGame;
		}

		drawFromDeck(deck) {
			return deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
		}

		showGame(game, state) {
			const dealerValue = this.getHandValue(game.dealer),
				playerValue = this.getHandValue(game.player),
				mystery = state == "end" && playerValue <= 21 ? "" : ", ???";
			let toDisplayDealer = game.dealer.map(card => `${card.value} ${card.suit}`).join(", "),
				toDisplayPlayer = game.player.map(card => `${card.value} ${card.suit}`).join(", ");

			toDisplayDealer = `**Dealer:** ${toDisplayDealer}${mystery} (value ${dealerValue})`;
			toDisplayPlayer = `**Player:** ${toDisplayPlayer} (value ${playerValue})`;

			if (state == "start") {
				if (playerValue == 21) {
					game.botMessage.edit(`${toDisplayDealer}\n${toDisplayPlayer}\n\nBLACKJACK!`);
				} else {
					return `${toDisplayDealer}\n${toDisplayPlayer}\n\n` +
					"Type `stand` to end your turn, or `hit` to draw another card.";
				}
			} else if (state == "drawing") {
				if (!game.message.channel.messages.has(game.botMessage.id)) return;
				game.botMessage.edit(`${toDisplayDealer}\n${toDisplayPlayer}\n\n` +
				"Type `stand` to end your turn, or `hit` to draw another card.");
			} else {
				if (!game.message.channel.messages.has(game.botMessage.id)) return;

				let result = "Tied";
				if (playerValue > 21) {
					result = "BUST";
				} else if (dealerValue > 21) {
					result = "Dealer Bust";
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
					if (collected.values().next().value.content == "stand") {
						this.dealDealerCards(game);
					} else {
						game.player.push(this.drawFromDeck(game.deck));
						if (this.getHandValue(game.player) < 21) {
							this.showGame(game, "drawing");
							this.awaitResponse(game);
						} else {
							this.endGame(game, "end");
						}
					}
				})
				.catch(() => this.dealDealerCards(game));
		}

		dealDealerCards(game) {
			while (this.getHandValue(game.dealer) < 17) {
				game.dealer.push(this.drawFromDeck(game.deck));
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
			const commonObjs = ["🔋", "🛒", "👞", "📎"],
				uncommonObjs = ["🐠", "🐡", "🐢", "🦐"],
				rareObjs = ["🦑", "🐙", "🐸"];

			const rand = Math.random();
			let fished;
			if (rand < 0.45) {
				fished = commonObjs[Math.floor(Math.random() * commonObjs.length)];
			} else if (rand < 0.75) {
				fished = "🐟";
			} else if (rand < 0.95) {
				fished = uncommonObjs[Math.floor(Math.random() * uncommonObjs.length)];
			} else {
				fished = rareObjs[Math.floor(Math.random() * rareObjs.length)];
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
						allowedValues: ["r", "rock", "p", "paper", "s", "scissors"]
					}
				],
				usage: "rps <r | rock | p | paper | s | scissors>"
			});
		}

		async run(bot, message, args, flags) {
			const choices = ["rock", "paper", "scissors"],
				userChoice = args[0].length == 1 ? choices.find(c => c.startsWith(args[0])) : args[0],
				botChoice = choices[Math.floor(Math.random() * 3)];
			let rpsResult;

			if (userChoice == botChoice) {
				rpsResult = "The game is a tie";
			} else {
				let win = false;
				if (userChoice == "rock" && botChoice == "scissors") win = true;
				if (userChoice == "paper" && botChoice == "rock") win = true;
				if (userChoice == "scissors" && botChoice == "paper") win = true;
				rpsResult = win ? "You win" : "The bot wins";
			}
			message.channel.send(`You chose ${userChoice} and I choose ${botChoice}. ${rpsResult}!`);
		}
	},
	class SlotsCommand extends Command {
		constructor() {
			super({
				name: "slots",
				description: "Roll the reels and try to match the symbols!",
				aliases: ["slot"]
			});
		}

		async run(bot, message, args, flags) {
			const symbols = ["🍒", "💵", "💰", "💎", "🍊", "🍋", "🍐", "🍉", "🍇", ":seven:"],
				chosen = [];
			for (let i = 0; i < 9; i++) {
				chosen.push(symbols[Math.floor(Math.random() * symbols.length)]);
			}

			let result = "lost...";
			if (chosen[3] == chosen[4] || chosen[3] == chosen[5] || chosen[4] == chosen[5]) {
				result = "matched 2 symbols!";
				if (chosen[3] == chosen[4] && chosen[3] == chosen[5] && chosen[4] == chosen[5]) {
					result = chosen[3] == ":seven:" ? "got three 7's! Lucky!" : "matched 3 symbols!";
				}
			}

			message.channel.send("**🎰 | Slot Game**\n" +
			"------------------\n" +
			`${chosen[0]} : ${chosen[1]} : ${chosen[2]}\n\n` +
			`${chosen[3]} : ${chosen[4]} : ${chosen[5]} **<<<**\n\n` +
			`${chosen[6]} : ${chosen[7]} : ${chosen[8]}\n` +
			"------------------\n" +
			`You rolled the slots... and ${result}`);
		}
	},
	class TriviaCommand extends Command {
		constructor() {
			super({
				name: "trivia",
				description: "See how much knowledge you have with trivia questions!",
				cooldown: {
					time: 30000,
					type: "user"
				}
			});
			this.questions = [];
			this.letters = ["A", "B", "C", "D"];
		}

		async run(bot, message, args, flags) {
			if (this.questions.length == 0) {
				try {
					this.questions = await this.getQuestions();
				} catch(err) {
					return {cmdWarn: err};
				}
			}

			const tQuestion = this.questions.splice(Math.floor(Math.random() * this.questions.length), 1)[0],
				tempAnswers = tQuestion.otherAnswers,
				answers = [],
				numAnswers = tQuestion.otherAnswers.length + 1;
			let answerLetter;

			tempAnswers.push(tQuestion.answer);

			for (let i = tempAnswers.length; i > 0; i--) {
				const ans = tempAnswers.splice(Math.floor(Math.random() * i), 1)[0];
				if (ans == tQuestion.answer) answerLetter = this.letters[numAnswers - i];
				answers.push(ans);
			}

			let i = -1;
			message.channel.send("__**Trivia**__" + "\n" + tQuestion.question.replace(/&quot;/g, "\"").replace(/&#039;/g, "'") + "\n\n" + answers.map(a => {
				i++;
				return `${this.letters[i]} - ${a}`;
			}).join("\n") + "\n\n" + "*Answer with the letter of your choice.*")
				.then(msg => {
					msg.channel.awaitMessages(msg2 => msg2.author.id == message.author.id && (["A", "B", "C", "D"]).includes(msg2.content.toUpperCase()), {
						max: 1,
						time: 30000,
						errors: ["time"]
					})
						.then(collected => {
							if (message.channel.messages.has(msg.id)) {
								msg.edit(msg.content + "\n\n" + `**${tQuestion.answer}**, choice ${answerLetter} is the correct answer!` +
									"(You chose " + collected.values().next().value.content.toUpperCase() + ")");
							}
						})
						.catch(() => {
							if (message.channel.messages.has(msg.id)) {
								msg.edit(msg.content + "\n\n" + "*You did not answer in time, try again!*");
							}
						});
				});
		}

		getQuestions() {
			return new Promise((resolve, reject) => {
				request.get({
					url: "https://opentdb.com/api.php",
					qs: {amount: 10},
					json: true
				}, (err, res) => {
					if (err) reject(`Could not request to Open Trivia Database: ${err.message} (${err.code})`);
					if (res.statusCode >= 400) reject(`An error has been returned from Open Trivia Database: ${res.statusMessage} (${res.statusCode}). Try again later.`);

					const results = res.body.results.map(r => {
						return {
							category: r.category,
							type: r.difficulty,
							question: r.question,
							answer: r.correct_answer,
							otherAnswers: r.incorrect_answers
						};
					});
					resolve(results);
				});
			});
		}
	}
];