const Command = require("../structures/command.js"),
	{capitalize} = require("../modules/functions.js"),
	request = require("request");

module.exports = [
	class FishyCommand extends Command {
		constructor() {
			super({
				name: "fishy",
				description: "Catch fish and other objects with a fishing pole!",
				aliases: ["fish"]
			});
			this.fishOutcomes = [
				{min: 0.98333, text: "🦑"},
				{min: 0.96666, text: "🐙"},
				{min: 0.95, text: "🐸"},
				{min: 0.9, text: "🐠"},
				{min: 0.85, text: "🐡"},
				{min: 0.8, text: "🐢"},
				{min: 0.75, text: "🦐"},
				{min: 0.45, text: "🐟"},
				{min: 0.3375, text: "🔋"},
				{min: 0.225, text: "🛒"},
				{min: 0.1125, text: "👞"},
				{min: 0, text: "📎"}
			];
		}

		async run(bot, message, args, flags) {
			const rand = Math.random();
			message.channel.send(`🎣 You used a fishing pole and caught: ${this.fishOutcomes.find(o => o.min <= rand).text}!`);
		}
	},
	class MineCommand extends Command {
		constructor() {
			super({
				name: "mine",
				description: "Search for minerals and more!"
			});
			this.mineOutcomes = [
				{min: 0.975, text: "found a 💎 diamond!"},
				{min: 0.95, text: "found a 💍 ring!"},
				{min: 0.9, text: "found 🟨 some gold!"},
				{min: 0.8, text: "found a 🏺 vase!"},
				{min: 0.6, text: "found a 🧱 brick."},
				{min: 0.4, text: "found 🦠 some microbes."},
				{min: 0.2, text: "found an 👞 old shoe."},
				{min: 0, text: "only found 🟫 dirt."}
			];
		}

		async run(bot, message, args, flags) {
			const rand = Math.random();
			message.channel.send(`⛏ You used a pickaxe and ${this.mineOutcomes.find(o => o.min <= rand).text}`);
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
				} catch (err) {
					return {cmdWarn: err};
				}
			}

			const questionData = this.questions.splice(Math.floor(Math.random() * this.questions.length), 1)[0],
				numAnswers = questionData.otherAnswers.length + 1,
				tempAnswers = questionData.otherAnswers,
				answers = [];
			let answerLetter;

			// All answers are included in tempAnswers
			tempAnswers.push(questionData.answer);

			for (let i = tempAnswers.length; i > 0; i--) {
				const ans = tempAnswers.splice(Math.floor(Math.random() * i), 1)[0];
				if (ans == questionData.answer) answerLetter = this.letters[numAnswers - i];
				answers.push(ans);
			}

			const responseChoices = this.letters.slice(0, numAnswers);
			message.channel.send("__**Trivia**__\n" +
				questionData.question + "\n\n" +
				answers.map((a, i) => `${this.letters[i]} - ${a}`).join("\n") + "\n\n" +
				"(Category: `" + questionData.category + "` | Difficulty: `" + capitalize(questionData.type) + "`)\n" +
				"*Answer with the letter of your choice.*")
				.then(msg => {
					msg.channel.awaitMessages(msg2 => msg2.author.id == message.author.id && responseChoices.includes(msg2.content.toUpperCase()), {
						maxMatches: 1,
						time: 30000,
						errors: ["time"]
					})
						.then(collected => {
							if (message.channel.messages.has(msg.id)) {
								msg.edit(msg.content + "\n\n" + `**${questionData.answer}**, choice ${answerLetter} is the correct answer! ` +
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
					if (err) return reject(`Could not request to Open Trivia Database: ${err.message} (${err.code})`);
					if (!res) return reject("No response was received from Open Trivia Database.");
					if (res.statusCode >= 400) return reject(`An error has been returned from Open Trivia Database: ${res.statusMessage} (${res.statusCode}). Try again later.`);

					const results = res.body.results.map(r => {
						return {
							category: r.category,
							type: r.difficulty,
							question: r.question.replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/&#039;/g, "'"),
							answer: r.correct_answer,
							otherAnswers: r.incorrect_answers.map(a => a.replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/&#039;/g, "'"))
						};
					});
					resolve(results);
				});
			});
		}
	}
];
