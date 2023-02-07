const {MessageEmbed} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	{checkRemoteRequest} = require("../../modules/functions.js"),
	crypto = require("crypto"),
	request = require("request");

function getHash(str) {
	const hexHash = crypto.createHash("md5").update(str).digest("hex");
	return parseInt(hexHash.slice(0, 10), 16);
}

const subcommands = [
	class EightBallSubcommand extends Command {
		constructor() {
			super({
				name: "8ball",
				description: "Ask the 8 ball a question",
				args: [
					{
						name: "question",
						description: "Yes/no question to ask",
						type: "string",
						required: true
					}
				]
			});
		}

		async run(ctx) {
			const magicMsgs = [
				"Certainly",
				"It is decidedly so",
				"Without a doubt",
				"Yes, definitely",
				"You may rely on it",
				"As I see it, yes",
				"Most likely",
				"Outlook good",
				"Sure",
				"Signs point to yes",
				"Reply hazy, try again",
				"Ask again later",
				"Better not tell you now",
				"Cannot predict now",
				"Concentrate and ask again",
				"Don't count on it",
				"My reply is no",
				"My sources say no",
				"Outlook not so good",
				"Very doubtful"
			];
			ctx.respond("🎱 " + (ctx.parsedArgs["question"].includes(" ") ? magicMsgs[Math.floor(Math.random() * 20)] :
				"You need to provide an actual question..."));
		}
	},
	class ChooseSubcommand extends Command {
		constructor() {
			super({
				name: "choose",
				description: "Have the bot choose among a list of items",
				args: [
					{
						name: "option1",
						description: "1st option",
						type: "string",
						required: true
					},
					{
						name: "option2",
						description: "2nd option",
						type: "string",
						required: true
					},
					{
						name: "option3",
						description: "3rd option",
						type: "string"
					},
					{
						name: "option4",
						description: "4th option",
						type: "string"
					},
					{
						name: "option5",
						description: "5th option",
						type: "string"
					},
					{
						name: "option6",
						description: "6th option",
						type: "string"
					},
					{
						name: "option7",
						description: "7th option",
						type: "string"
					},
					{
						name: "option8",
						description: "8th option",
						type: "string"
					},
					{
						name: "option9",
						description: "9th option",
						type: "string"
					},
					{
						name: "option10",
						description: "10th option",
						type: "string"
					}
				]
			});
		}

		async run(ctx) {
			const choices = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
				.map(num => ctx.parsedArgs["choice" + num])
				.filter(choice => choice != undefined);
			let choice = choices[Math.floor(Math.random() * choices.length)];
			if (choice.length > 1500) choice = choice.slice(0, 1500) + "...";
			ctx.respond("I choose: **" + choice + "**");
		}
	},
	class CoinSubcommand extends Command {
		constructor() {
			super({
				name: "coin",
				description: "Flip two-sided coins (heads/tails)",
				args: [
					{
						name: "count",
						description: "Number of coins",
						type: "integer",
						min: 1,
						max: 50
					}
				]
			});
		}

		async run(ctx) {
			const iters = ctx.parsedArgs["count"] || 1;
			if (iters == 1) {
				ctx.respond("I flipped a coin and got " + (Math.random() < 0.5 ? "Heads" : "Tails"));
			} else {
				let res = "", heads = 0;
				for (let i = 0; i < iters; i++) {
					if (Math.random() < 0.5) {res += "Heads "; heads++} else {res += "Tails "}
				}
				ctx.respond("I flipped " + iters + " coins and got:\n" +
					res + `\n(${heads} heads and ${iters - heads} tails)`);
			}
		}
	},
	class JokeSubcommand extends Command {
		constructor() {
			super({
				name: "joke",
				description: "A variety of jokes",
				args: [
					{
						name: "type",
						description: "Kind of joke",
						type: "string",
						choices: [
							{name: "Normal Jokes", value: "jokes"},
							{name: "Puns", value: "puns"},
							{name: "Antijokes", value: "antijokes"}
						],
						required: true
					}
				],
				cooldown: {
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});

			this.jokeData = {
				jokes: {
					lastChecked: 0,
					cachedPosts: [],
					fetchPosts: () => this.getJokes()
				},
				puns: {
					lastChecked: 0,
					cachedPosts: [],
					fetchPosts: () => this.getPuns()
				},
				antijokes: {
					lastChecked: 0,
					cachedPosts: [],
					fetchPosts: () => this.getAntiJokes()
				}
			};
		}

		async run(ctx) {
			const jokeType = ctx.parsedArgs["type"];
			const currentJokeData = this.jokeData[jokeType];

			if (Date.now() > currentJokeData.lastChecked + 1000*7200 || currentJokeData.cachedPosts.length == 0) {
				await ctx.interaction.deferReply();
				try {
					currentJokeData.cachedPosts = await currentJokeData.fetchPosts();
				} catch (err) {
					return ctx.respond(err, {level: "warning"});
				}
			}

			if (jokeType == "jokes") {
				let embedDesc = "", postData;
				while (embedDesc.length < 1500) {
					if (currentJokeData.cachedPosts.length < 5) {
						try {
							currentJokeData.cachedPosts = await this.getJokes();
						} catch (err) {
							break;
						}
					}

					postData = currentJokeData.cachedPosts.splice(Math.floor(Math.random() * currentJokeData.cachedPosts.length), 1)[0];

					const toDisplayDesc = `**[${postData.title}](https://redd.it/${postData.id})**` + "\n" +
						postData.desc + "\n" +
						`- 👍 ${postData.score} | 💬 ${postData.comments}` + "\n\n";

					if (embedDesc.length == 0 && postData.desc.length >= 1500) {
						embedDesc += `**[${postData.title}](https://redd.it/${postData.id})**` + "\n" +
							postData.desc + "..." + "\n" +
							`- 👍 ${postData.score} | 💬 ${postData.comments}` + "\n\n";
						break;
					} else if (embedDesc.length + toDisplayDesc.length > 2000) {
						if (toDisplayDesc.length / (1500 - embedDesc.length) > 2) {
							if (embedDesc.length < 1000) {
								currentJokeData.cachedPosts.push(postData);
								continue;
							} else {
								break;
							}
						} else {
							embedDesc += `**[${postData.title}](https://redd.it/${postData.id})**` + "\n" +
								postData.desc.slice(0, postData.desc.length - ((embedDesc.length + toDisplayDesc.length) - 2000)) + "..." + "\n" +
								`- 👍 ${postData.score} | 💬 ${postData.comments}` + "\n\n";
							break;
						}
					} else {
						embedDesc += toDisplayDesc;
					}
				}

				ctx.respond(new MessageEmbed()
					.setTitle("Here's some jokes!")
					.setDescription(embedDesc)
					.setColor(Math.floor(Math.random() * 16777216))
				);
			} else if (jokeType == "puns") {
				const postData = currentJokeData.cachedPosts.splice(Math.floor(Math.random() * currentJokeData.cachedPosts.length), 1)[0],
					punEmbed = new MessageEmbed()
						.setTitle(postData.title.length > 250 ? postData.title.slice(0, 250) + "..." : postData.title)
						.setURL("https://reddit.com" + postData.url)
						.setColor(Math.floor(Math.random() * 16777216))
						.setFooter({text: `👍 ${postData.score} | 💬 ${postData.comments} | 👤 ${postData.author}`});

				if (postData.desc) punEmbed.setDescription(postData.desc);
				if (postData.imageURL) {
					if (postData.imageURL.startsWith("https://external-") || /\.(gif|jpe?g|png)$/.test(postData.imageURL)) {
						punEmbed.setImage(postData.imageURL);
					} else {
						ctx.respond(`${postData.imageURL} (👍 ${postData.score} | 💬 ${postData.comments} | 👤 ${postData.author} | ID: ${postData.url.match(/comments\/([0-9a-z]+)(?=\/)/)[1]})`);
						return;
					}
				}

				ctx.respond(punEmbed);
			} else {
				const postData = currentJokeData.cachedPosts.splice(Math.floor(Math.random() * currentJokeData.cachedPosts.length), 1)[0];
				ctx.respond(new MessageEmbed()
					.setTitle(postData.title.length > 250 ? postData.title.slice(0, 250) + "..." : postData.title)
					.setURL("https://reddit.com" + postData.url)
					.setDescription(postData.desc)
					.setColor(Math.floor(Math.random() * 16777216))
					.setFooter({text: `👍 ${postData.score} | 💬 ${postData.comments} | 👤 ${postData.author}`})
				);
			}
		}

		getJokes() {
			return new Promise((resolve, reject) => {
				request.get({
					url: "https://reddit.com/r/Jokes/hot.json",
					qs: {limit: 50, raw_json: 1},
					json: true
				}, (err, res) => {
					if (err) return reject(`Could not request to Reddit: ${err.message} (${err.code})`);
					if (!res) return reject("No response was received from Reddit.");
					if (res.statusCode >= 400) return reject(`An error has been returned from Reddit: ${res.statusMessage} (${res.statusCode}). Try again later.`);

					this.jokeData.jokes.lastChecked = Date.now();
					resolve(res.body.data.children
						.filter(r => !r.data.stickied && !r.data.over_18)
						.map(r => {
							return {
								title: r.data.title,
								desc: r.data.selftext.trim().replace(/#x200B;/g, "").replace(/\n{3,}/g, "\n\n").slice(0, 1500),
								id: r.data.id,
								score: r.data.score,
								comments: r.data.num_comments
							};
						})
					);
				});
			});
		}

		getPuns() {
			return new Promise((resolve, reject) => {
				request.get({
					url: "https://reddit.com/r/puns/hot.json",
					qs: {raw_json: 1},
					json: true
				}, (err, res) => {
					if (err) return reject(`Could not request to Reddit: ${err.message} (${err.code})`);
					if (!res) return reject("No response was received from Reddit.");
					if (res.statusCode >= 400) return reject(`An error has been returned from Reddit: ${res.statusMessage} (${res.statusCode}). Try again later.`);

					this.jokeData.puns.lastChecked = Date.now();
					resolve(res.body.data.children
						.filter(r => !r.data.stickied && r.data.score > 0)
						.map(r => {
							let punText = null;
							if (r.data.selftext != "") {
								punText = r.data.selftext.trim().replace(/#x200B;/g, "").replace(/\n{3,}/g, "\n\n");
								if (punText.length > 2000) punText = `${punText}...`;
							}

							let imageURL = null;
							if (r.data.thumbnail != "self") {
								imageURL = r.data.url;
								if (/v\.redd\.it/.test(r.data.url) && r.data.preview) imageURL = r.data.preview.images[0].source.url;
							}

							return {
								title: r.data.title,
								desc: punText,
								url: r.data.permalink,
								score: r.data.score,
								comments: r.data.num_comments,
								author: r.data.author,
								imageURL: imageURL
							};
						})
					);
				});
			});
		}

		getAntiJokes() {
			return new Promise((resolve, reject) => {
				request.get({
					url: "https://reddit.com/r/AntiJokes/hot.json",
					qs: {raw_json: 1},
					json: true
				}, (err, res) => {
					if (err) return reject(`Could not request to Reddit: ${err.message} (${err.code})`);
					if (!res) return reject("No response was received from Reddit.");
					if (res.statusCode >= 400) return reject(`An error has been returned from Reddit: ${res.statusMessage} (${res.statusCode}). Try again later.`);

					this.jokeData.antijokes.lastChecked = Date.now();
					resolve(res.body.data.children
						.filter(r => !r.data.stickied && r.data.score > 0)
						.map(r => {
							const rCrossposts = r.data.crosspost_parent_list;
							let rDesc;
							if (r.data.selftext) {
								rDesc = r.data.selftext;
							} else if (rCrossposts) {
								rDesc = rCrossposts[0].selftext || "";
							} else {
								rDesc = "";
							}
							rDesc = rDesc.trim().replace(/#x200B;/g, "").replace(/\n{3,}/g, "\n\n");

							return {
								title: r.data.title,
								desc: rDesc.length > 2000 ? rDesc.slice(0, 2000) + "..." : rDesc,
								url: r.data.permalink,
								score: r.data.score,
								comments: r.data.num_comments,
								author: r.data.author
							};
						})
					);
				});
			});
		}
	},
	class NumberFactsSubcommand extends Command {
		constructor() {
			super({
				name: "numberfacts",
				description: "Get interesting facts about a number",
				args: [
					{
						name: "number",
						description: "The number",
						type: "integer",
						required: true
					},
					{
						name: "fallback",
						description: "Fallback if no facts are found",
						type: "string",
						choices: [
							{name: "Previous", value: "previous"},
							{name: "Next", value: "next"}
						]
					}
				]
			});
		}

		async run(ctx) {
			await ctx.interaction.deferReply();

			const num = ctx.parsedArgs["number"],
				fallback = ctx.parsedArgs["fallback"],
				reqQuery = {json: true};

			if (fallback == "previous") {
				reqQuery.notfound = "ceil";
			} else if (fallback == "next") {
				reqQuery.notfound = "floor";
			}

			request.get({
				url: "http://numbersapi.com/" + num,
				qs: reqQuery,
				json: true
			}, (err, res) => {
				const requestRes = checkRemoteRequest("Number Facts API", err, res);
				if (requestRes != true) return ctx.respond(requestRes);

				ctx.respond(res.body.found || fallback ?
					"🔢 " + res.body.text : "No facts found! Try searching Wikipedia for **" + num + " (number)**");
			});
		}
	},
	class RateSubcommand extends Command {
		constructor() {
			super({
				name: "rate",
				description: "Have the bot rate someone or something for you",
				args: [
					{
						name: "input",
						description: "The thing to rate",
						type: "string",
						parsedType: "user",
						parsedTypeParams: {allowRaw: true},
						required: true
					}
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
			this.rateStates = [
				{min: 10, msg: "PERFECT! ❣"},
				{min: 9.8, msg: "Almost Perfect! ☺"},
				{min: 9, msg: "Awesome! 😄"},
				{min: 8, msg: "Great 😉"},
				{min: 7, msg: "Pretty Good 😌"},
				{min: 6.9, msg: "😏"},
				{min: 6, msg: "Above Average 🙂"},
				{min: 5, msg: "About Average 😶"},
				{min: 4, msg: "Below Average 😕"},
				{min: 3, msg: "Poor 😦"},
				{min: 2, msg: "Bad 😥"},
				{min: 1, msg: "Awful 😰"}
			];
		}

		async run(ctx) {
			const x = ctx.parsedArgs["input"];
			let toRate;
			if (typeof x == "string") {
				if (x.toLowerCase() == ctx.bot.user.username.toLowerCase() || x == ctx.bot.user.tag) {
					return ctx.respond("I would rate myself a 10/10, of course.");
				} else {
					toRate = x.toLowerCase() == "me" ? ctx.interaction.user.tag : x;
				}
			} else {
				toRate = x.user.tag;
			}

			const hash = getHash(toRate);
			let rating, toSend;
			if (toRate == ctx.interaction.user.tag || toRate.toLowerCase() == "me") {
				rating = (Math.abs(hash % 50 / 10) + 5).toFixed(1);
				toSend = "I would rate you: ";
			} else {
				rating = (Math.abs(hash % 90 / 10) + 1).toFixed(1);
				let toRateRaw = toRate;
				if (toRateRaw.length > 1500) toRateRaw = toRateRaw.slice(0, 1500) + "...";
				toSend = "I would rate `" + toRateRaw + "`: ";
			}

			// Set the color of the embed based on the rating
			const rand = Math.floor(Math.random() * 255);
			let r = 0, g = 0, b = 0;
			switch (Math.floor(Math.random() * 3)) {
				case 0:
					r = 255;
					if (Math.random() < 0.5) {g = rand} else {b = rand}
					break;
				case 1:
					g = 255;
					if (Math.random() < 0.5) {b = rand} else {r = rand}
					break;
				case 2:
					b = 255;
					if (Math.random() < 0.5) {r = rand} else {g = rand}
			}

			const rMultiplier = (rating - 1) / 9;
			ctx.respond(new MessageEmbed()
				.setDescription(toSend + "\n" +
					"`" + "█".repeat(Math.round(rating)) + " ‍‍".repeat(10 - Math.round(rating)) + "` " + `**${rating}**/10\n` +
					this.rateStates.find(state => state.min <= rating).msg)
				.setColor(Math.floor(r * rMultiplier) * 65536 + Math.floor(g * rMultiplier) * 256 + Math.floor(b * rMultiplier))
			);
		}
	},
	class SaySubcommand extends Command {
		constructor() {
			super({
				name: "say",
				description: "Have the bot say something for you",
				args: [
					{
						name: "text",
						description: "The text to say",
						type: "string",
						required: true
					},
					{
						name: "embed",
						description: "Embeds the output message",
						type: "boolean"
					}
				]
			});
		}

		async run(ctx) {
			const text = ctx.parsedArgs["text"];
			if (ctx.parsedArgs["embed"]) {
				if (!ctx.interaction.channel.permissionsFor(ctx.bot.user).has("EMBED_LINKS")) {
					return ctx.respond({content: "To post an embed, the bot requires the `Embed Links` permission.", ephemeral: true}, {level: "warning"});
				}

				await ctx.respond({content: "Done!", ephemeral: true});
				ctx.respond(new MessageEmbed()
					.setColor(Math.floor(Math.random() * 16777216))
					.setDescription(text), {followUp: true});
			} else {
				await ctx.respond({content: "Done!", ephemeral: true});
				ctx.respond(text, {followUp: true});
			}
		}
	},
	class ShipSubcommand extends Command {
		constructor() {
			super({
				name: "ship",
				description: "Ships two users, or to another user if one user is provided, and generates a ship name",
				args: [
					{
						name: "user1",
						description: "1st user",
						type: "string",
						parsedType: "user",
						parsedTypeParams: {allowRaw: true},
						required: true
					},
					{
						name: "user2",
						description: "2nd user",
						type: "string",
						parsedType: "user",
						parsedTypeParams: {allowRaw: true}
					}
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
			this.shipStates = [
				{min: 10, msg: "PERFECT MATCH! ❣"},
				{min: 9.8, msg: "Almost Perfect Match! 💞"},
				{min: 9, msg: "Awesome! 💟"},
				{min: 8, msg: "Great 💖"},
				{min: 7, msg: "Pretty Good 💗"},
				{min: 6.9, msg: "😏"},
				{min: 6, msg: "Above Average 💜"},
				{min: 5, msg: "About Average ❤"},
				{min: 4, msg: "Below Average 💙"},
				{min: 3, msg: "Poor 💚"},
				{min: 2, msg: "Bad 🖤"},
				{min: 1, msg: "Not a match! 💔"}
			];
		}

		async run(ctx) {
			const user1 = ctx.parsedArgs["user1"],
				user2 = ctx.parsedArgs["user2"];
			const user1IsString = typeof user1 == "string",
				user2IsString = typeof user2 == "string";

			if (user1IsString || (user2 && user2IsString)) {
				if ((user1IsString && user1.length < 2) || (user2 && user2IsString && user2.length < 2)) {
					return ctx.respond("One of the ship names is too short.", {level: "warning"});
				}
				if ((user1IsString && user1.length > 100) || (user2 && user2IsString && user2.length > 100)) {
					return ctx.respond("One of the ship names is too long.", {level: "warning"});
				}
			}

			let toShip1 = user1IsString ? user1 : user1.user.username,
				toShip2;
			if (user2) {
				toShip2 = user2IsString ? user2 : user2.user.username;
			} else {
				toShip2 = toShip1;
				toShip1 = ctx.interaction.user.username;
			}

			const fullShipName = toShip1 + toShip2,
				shipName = toShip1.slice(0, Math.floor(toShip1.length / 2)) + toShip2.slice(Math.floor(toShip2.length / 2));
			const hash = getHash(fullShipName);

			const shipRating = parseFloat((Math.abs(hash % 90) / 10 + 1).toFixed(1));
			let shipDescription = "**Ship Name**: " + shipName + "\n" +
				"**Ship Rating**: `" + "█".repeat(Math.round(shipRating)) + " ‍‍".repeat(10 - Math.round(shipRating)) + "` " +
					`**${shipRating}**/10\n` +
				this.shipStates.find(state => state.min <= shipRating).msg;
			if (toShip1 == toShip2) shipDescription += "\n\n*Forever alone!*";
			ctx.respond(new MessageEmbed()
				.setTitle(toShip1 + " 💗 " + toShip2)
				.setColor(131073 * Math.floor(shipRating * 12.5))
				.setDescription(shipDescription)
			);
		}
	}
];

class FunCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "fun",
			description: "Fun commands",
			subcommands: subcommands
		});
	}
}

module.exports = FunCommandGroup;
