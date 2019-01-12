const Command = require("../structures/command.js"),
	request = require("request");

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
			const commonObjs = ["🔋", "🛒", "👞", "📎"],
				uncommonObjs = ["🐠", "🐡", "🐢", "🦐"],
				rareObjs = ["🦑", "🐙", "🐸"];
			
			const rand = Math.random();
			let fished;
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
			const choices = ["rock", "paper", "scissors"],
				userChoice = args[0],
				botChoice = choices[Math.floor(Math.random() * 3)];
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
			
			let tQuestion = this.questions.splice(Math.floor(Math.random() * this.questions.length), 1)[0],
				tempAnswers = tQuestion.otherAnswers,
				answers = [],
				numAnswers = tQuestion.otherAnswers.length + 1,
				answerLetter = null;
			
			tempAnswers.push(tQuestion.answer);
			
			for (let i = tempAnswers.length; i > 0; i--) {
				let ans = tempAnswers.splice(Math.floor(Math.random() * i), 1)[0];
				if (ans == tQuestion.answer) answerLetter = this.letters[numAnswers - i];
				answers.push(ans);
			}
			
			let i = -1;
			message.channel.send("__**Trivia**__" + "\n" + tQuestion.question.replace(/&quot;/g, "\"").replace(/&#039;/g, "'") + "\n\n" + answers.map(a => {
				i++;
				return `${this.letters[i]} - ${a}`
			}).join("\n") + "\n\n" + "*Answer with the letter of your choice.*")
			.then(msg => {
				msg.channel.awaitMessages(msg2 => msg2.author.id == message.author.id && (["A", "B", "C", "D"]).includes(msg2.content.toUpperCase()), {
					max: 1,
					time: 30000,
					errors: ["time"]
				})
				.then(collected => {
					if (!msg.deleted) {
						msg.edit(msg.content + "\n\n" + `**${tQuestion.answer}**, choice ${answerLetter} is the correct answer! (You chose ${collected.array()[0].content.toUpperCase()})`)
					}
				})
				.catch(err => {
					if (!msg.deleted) {
						msg.edit(msg.content + "\n\n" + "*You did not answer in time, try again!*")
					}
				})
			})
		}
		
		getQuestions() {
			return new Promise((resolve, reject) => {
				request.get({
					url: "https://opentdb.com/api.php",
					qs: {amount: 10},
					json: true
				}, (err, res) => {
					if (err) return reject(`Could not request to Open Trivia Database: ${err.message}`);
					if (!res) return reject("No response was received from Open Trivia Database.");
					if (res.statusCode >= 400) return reject(`The request to Open Trivia Database failed with status code ${res.statusCode} (${res.statusMessage})`);
					
					const results = res.body.results.map(r => {
						return {
							category: r.category,
							type: r.difficulty,
							question: r.question,
							answer: r.correct_answer,
							otherAnswers: r.incorrect_answers
						}
					})
					resolve(results);
				})
			})
		}
	}
]
