const {MessageActionRow, MessageButton} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	{capitalize} = require("../../modules/functions.js"),
	request = require("request");

const subcommands = [
	class FishySubcommand extends Command {
		constructor() {
			super({
				name: "fishy",
				description: "Fishy simulator"
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

		async run(ctx) {
			const rand = Math.random();
			ctx.respond(`🎣 You used a fishing pole and caught: ${this.fishOutcomes.find(o => o.min <= rand).text}!`);
		}
	},
	class MineSubcommand extends Command {
		constructor() {
			super({
				name: "mine",
				description: "Mine simulator"
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

		async run(ctx) {
			const rand = Math.random();
			ctx.respond(`⛏ You used a pickaxe and ${this.mineOutcomes.find(o => o.min <= rand).text}`);
		}
	},
	class RPSSubcommand extends Command {
		constructor() {
			super({
				name: "rps",
				description: "Rock, Paper, Scissors",
				args: [
					{
						name: "choice",
						description: "Your choice",
						type: "string",
						choices: [
							{name: "Rock", value: "rock"},
							{name: "Paper", value: "paper"},
							{name: "Scissors", value: "scissors"}
						],
						required: true
					}
				]
			});
		}

		async run(ctx) {
			const choices = ["rock", "paper", "scissors"],
				userChoice = ctx.parsedArgs["choice"],
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
			ctx.respond(`You chose ${userChoice} and I choose ${botChoice}. ${rpsResult}!`);
		}
	},
	class TriviaSubcommand extends Command {
		constructor() {
			super({
				name: "trivia",
				description: "Test your trivia knowledge",
				cooldown: {
					time: 30000,
					type: "user"
				}
			});
			this.questions = [];
			this.letters = ["A", "B", "C", "D"];
		}

		async run(ctx) {
			if (this.questions.length == 0) {
				await ctx.interaction.deferReply();
				try {
					this.questions = await this.getQuestions();
				} catch (err) {
					return ctx.respond(err, {level: "warning"});
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

			const buttons = [
				new MessageButton().setCustomId("choice_a").setLabel("A").setStyle("PRIMARY"),
				new MessageButton().setCustomId("choice_b").setLabel("B").setStyle("PRIMARY"),
				new MessageButton().setCustomId("choice_c").setLabel("C").setStyle("PRIMARY"),
				new MessageButton().setCustomId("choice_d").setLabel("D").setStyle("PRIMARY")
			];

			const originalTriviaContent = "__**Trivia**__\n" +
				questionData.question + "\n\n" +
				answers.map((a, i) => `${this.letters[i]} - ${a}`).join("\n") + "\n\n" +
				"(Category: `" + questionData.category + "` | Difficulty: `" + capitalize(questionData.type) + "`)\n" +
				"*Answer with the letter of your choice.*";

			ctx.respond({
				content: originalTriviaContent,
				components: [new MessageActionRow().addComponents(buttons.slice(0, numAnswers)).toJSON()]
			});

			const id = ctx.interaction.user.id;

			ctx.interaction.channel.awaitMessageComponent({
				filter: interaction2 => interaction2.user.id == id,
				time: 30000
			})
				.then(interaction2 => {
					interaction2.update({
						content: originalTriviaContent + "\n\n" +
							`**${questionData.answer}**, choice ${answerLetter} is the correct answer! ` +
							"(You chose " + interaction2.label + ")",
						components: []
					});
				})
				.catch(() => {
					ctx.respond({
						content: originalTriviaContent + "\n\n" + "*You did not answer in time, try again!*",
						components: []
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

class GamesCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "games",
			description: "Bot games",
			subcommands: subcommands
		});
	}
}

module.exports = GamesCommandGroup;
