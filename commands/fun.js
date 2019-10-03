const {RichEmbed} = require("discord.js"),
	Command = require("../structures/command.js"),
	request = require("request");

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

module.exports = [
	class EightBallCommand extends Command {
		constructor() {
			super({
				name: "8ball",
				description: "Ask the 8 ball a yes/no question and get an answer!",
				aliases: ["8b"],
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				usage: "8ball <question>"
			});
		}

		async run(bot, message, args, flags) {
			message.channel.send("🎱 " + (args[0].includes(" ") ? magicMsgs[Math.floor(Math.random() * 20)] : "You need to provide an actual question..."));
		}
	},
	class AntiJokeCommand extends Command {
		constructor() {
			super({
				name: "antijoke",
				description: "Jokes but without the punchline",
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
			this.cachedPosts = [];
			this.lastChecked = 0;
		}

		async run(bot, message, args, flags) {
			if (Date.now() > this.lastChecked + 1000*7200 || this.cachedPosts.length == 0) {
				try {
					this.cachedPosts = await this.getAntiJokes();
				} catch(err) {
					return {cmdWarn: err};
				}
			}

			const postData = this.cachedPosts.splice(Math.floor(Math.random() * this.cachedPosts.length), 1)[0];

			message.channel.send(new RichEmbed()
				.setTitle(postData.title.length > 250 ? `${postData.title.slice(0,250)}...` : postData.title)
				.setURL("https://reddit.com" + postData.url)
				.setDescription(postData.desc)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter(`👍 ${postData.score} | 💬 ${postData.comments} | By: ${postData.author}`)
			);
		}

		getAntiJokes() {
			return new Promise((resolve, reject) => {
				request.get({
					url: "https://reddit.com/r/AntiJokes/hot.json",
					qs: {raw_json: 1},
					json: true
				}, (err, res) => {
					if (err) return reject(`Could not request to Reddit: ${err.message} (${err.code})`);
					if (res.statusCode >= 400) return reject(`An error has been returned from Reddit: ${res.statusMessage} (${res.statusCode}). Try again later.`);

					this.lastChecked = Date.now();
					resolve(res.body.data.children
						.filter(r => !r.data.stickied && r.data.score > 0)
						.map(r => {
							const rCrossposts = r.data.crosspost_parent_list,
								rDesc = r.data.selftext || ((rCrossposts && rCrossposts[0].selftext) || "");
							return {
								title: r.data.title,
								desc: rDesc.length > 2000 ? `${rDesc.slice(0,2000)}...` : rDesc,
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
	class CatFactsCommand extends Command {
		constructor() {
			super({
				name: "catfacts",
				description: "Get some cat facts!",
				aliases: ["catfact"],
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
		}

		async run(bot, message, args, flags) {
			request.get({
				url: "https://catfact.ninja/facts",
				qs: {limit: 3},
				json: true
			}, (err, res) => {
				if (err || (res && res.statusCode >= 400)) return bot.handleRemoteSiteError(message, "Cat Facts API", err, res);

				message.channel.send(new RichEmbed()
					.setTitle("🐱 Cat Facts")
					.setDescription(res.body.data.map(entry => entry.fact).join("\n\n"))
					.setColor(Math.floor(Math.random() * 16777216))
				);
			});
		}
	},
	class ChooseCommand extends Command {
		constructor() {
			super({
				name: "choose",
				description: "Have the bot choose among a list of items. Include quotes to group words of a choice together",
				args: [
					{
						allowQuotes: true,
						infiniteArgs: true,
						parseSeperately: true,
						type: "string"
					}
				],
				usage: "choose <choice 1> <choice 2> [choices...]"
			});
		}

		async run(bot, message, args, flags) {
			if (args.length < 2) return {cmdWarn: "You need to provide at least 2 choices for me to choose from!", cooldown: null, noLog: true};
			message.channel.send(`I choose: **${args[Math.floor(Math.random() * args.length)]}**`);
		}
	},
	class CoinFlipCommand extends Command {
		constructor() {
			super({
				name: "coinflip",
				description: "Flip a coin. You can specify a number of coins to flip",
				aliases: ["coin", "flipcoin"],
				args: [
					{
						optional: true,
						type: "number",
						min: 1,
						max: 50
					}
				],
				usage: "coinflip [1-50]"
			});
		}

		async run(bot, message, args, flags) {
			const iters = args[0] || 1;
			if (iters == 1) {
				message.channel.send("I flipped a coin and got " + (Math.random() < 0.5 ? "Heads" : "Tails"));
			} else {
				const res = [];
				let heads = 0;
				for (let i = 0; i < iters; i++) {
					if (Math.random() < 0.5) {res.push("Heads"); heads++} else {res.push("Tails")}
				}
				message.channel.send(`I flipped ${iters} coins and got: ${res.join(", ")}` + "\n" +
				`(${heads} heads and ${iters-heads} tails)`);
			}
		}
	},
	class DogFactsCommand extends Command {
		constructor() {
			super({
				name: "dogfacts",
				description: "Get some dog facts!",
				aliases: ["dogfact"],
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
		}

		async run(bot, message, args, flags) {
			request.get({
				url: "http://dog-api.kinduff.com/api/facts",
				qs: {number: 3},
				json: true
			}, (err, res) => {
				if (err || (res && res.statusCode >= 400)) return bot.handleRemoteSiteError(message, "Dog Facts API", err, res);

				message.channel.send(new RichEmbed()
					.setTitle("🐶 Dog Facts")
					.setDescription(res.body.facts.join("\n\n"))
					.setColor(Math.floor(Math.random() * 16777216))
				);
			});
		}
	},
	class JokeCommand extends Command {
		constructor() {
			super({
				name: "joke",
				description: "Gets some jokes",
				aliases: ["jokes"],
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
			this.cachedPosts = [];
			this.lastChecked = 0;
			this.nextPost = null;
		}

		async run(bot, message, args, flags) {
			if (Date.now() > this.lastChecked + 1000*7200 || this.cachedPosts.length == 0) {
				try {
					this.cachedPosts = await this.getJokes();
				} catch(err) {
					return {cmdWarn: err};
				}
			}

			let embedDesc = "", postData;
			while (embedDesc.length < 1600) {
				if (this.cachedPosts.length < 5) {
					try {
						this.cachedPosts = await this.getJokes();
					} catch(err) {
						break;
					}
				}

				postData = this.cachedPosts.splice(Math.floor(Math.random() * this.cachedPosts.length), 1)[0];

				const title = `**[${postData.title}](https://redd.it/${postData.id})**` + "\n",
					toDisplayDesc = postData.desc,
					meta = "\n" + `- 👍 ${postData.score} | 💬 ${postData.comments}` + "\n\n";

				if (embedDesc.length == 0 && postData.desc.length >= 1600) {
					embedDesc += title + toDisplayDesc + "..." + meta;
					break;
				} else if (embedDesc.length + toDisplayDesc.length > 2000) {
					if (toDisplayDesc.length / (1600 - embedDesc.length) > 2) {
						if (embedDesc.length < 1000) {
							this.cachedPosts.push(postData);
							continue;
						} else {
							break;
						}
					} else {
						embedDesc += title + toDisplayDesc.slice(0, 1600 - embedDesc.length) + "..." + meta;
						break;
					}
				} else {
					embedDesc += title + toDisplayDesc + meta;
				}
			}

			message.channel.send(new RichEmbed()
				.setTitle("Here's some jokes!")
				.setDescription(embedDesc)
				.setColor(Math.floor(Math.random() * 16777216))
			);
		}

		getJokes() {
			return new Promise((resolve, reject) => {
				request.get({
					url: "https://reddit.com/r/Jokes/hot.json",
					qs: {limit: 50, raw_json: 1},
					json: true
				}, (err, res) => {
					if (err) return reject(`Could not request to Reddit: ${err.message} (${err.code})`);
					if (res.statusCode >= 400) return reject(`An error has been returned from Reddit: ${res.statusMessage} (${res.statusCode}). Try again later.`);

					this.lastChecked = Date.now();
					resolve(res.body.data.children
						.filter(r => !r.data.stickied && !r.data.over_18)
						.map(r => {
							const rDesc = r.data.selftext.trim();
							return {
								title: r.data.title,
								desc: rDesc.length > 1600 ? rDesc.slice(0, 1600) : rDesc,
								id: r.data.id,
								score: r.data.score,
								comments: r.data.num_comments
							};
						})
					);
				});
			});
		}
	},
	class NumberFactsCommand extends Command {
		constructor() {
			super({
				name: "numberfacts",
				description: "Get interesting facts about a number",
				aliases: ["numfacts"],
				args: [
					{
						type: "number",
						min: -1000,
						max: 9e+19
					}
				],
				flags: [
					{
						name: "ceil",
						desc: "If no facts are found, find the next interesting number above the provided number"
					},
					{
						name: "floor",
						desc: "If no facts are found, find the next interesting number below the provided number"
					}
				],
				usage: "numberfacts <number> [--(ceil|floor)]"
			});
		}

		async run(bot, message, args, flags) {
			const num = args[0],
				hasCeilFlag = flags.some(f => f.name == "ceil"),
				hasFloorFlag = flags.some(f => f.name == "floor"),
				reqQuery = {json: true};
			if (hasCeilFlag) {
				reqQuery.notfound = "ceil";
			} else if (hasFloorFlag) {
				reqQuery.notfound = "floor";
			}

			request.get({
				url: "http://numbersapi.com/" + num,
				qs: reqQuery,
				json: true
			}, (err, res) => {
				if (err || (res && res.statusCode >= 400)) return bot.handleRemoteSiteError(message, "Number Facts API", err, res);

				message.channel.send(res.body.found || (hasCeilFlag || hasFloorFlag) ? res.body.text : "No results found! Try searching Wikipedia for **" + num + " (number)**");
			});
		}
	},
	class PunCommand extends Command {
		constructor() {
			super({
				name: "pun",
				description: "Gets a pun",
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
			this.cachedPosts = [];
			this.lastChecked = 0;
		}

		async run(bot, message, args, flags) {
			if (Date.now() > this.lastChecked + 1000*7200 || this.cachedPosts.length == 0) {
				try {
					this.cachedPosts = await this.getPuns();
				} catch(err) {
					return {cmdWarn: err};
				}
			}

			const postData = this.cachedPosts.splice(Math.floor(Math.random() * this.cachedPosts.length), 1)[0],
				punEmbed = new RichEmbed()
					.setTitle(postData.title.length > 250 ? `${postData.title.slice(0,250)}...` : postData.title)
					.setURL(`https://reddit.com${postData.url}`)
					.setColor(Math.floor(Math.random() * 16777216))
					.setFooter(`👍 ${postData.score} | 💬 ${postData.comments} | By: ${postData.author}`);
			if (postData.desc) punEmbed.setDescription(postData.desc);
			if (postData.imageURL) punEmbed.setImage(postData.imageURL);

			message.channel.send(punEmbed);
		}

		getPuns() {
			return new Promise((resolve, reject) => {
				request.get({
					url: "https://reddit.com/r/puns/hot.json",
					qs: {raw_json: 1},
					json: true
				}, (err, res) => {
					if (err) return reject(`Could not request to Reddit: ${err.message} (${err.code})`);
					if (res.statusCode >= 400) return reject(`An error has been returned from Reddit: ${res.statusMessage} (${res.statusCode}). Try again later.`);

					this.lastChecked = Date.now();
					resolve(res.body.data.children
						.filter(r => !r.data.stickied)
						.map(r => {
							return {
								title: r.data.title,
								desc: r.data.selftext != "" ? r.data.selftext.trim() : null,
								url: r.data.permalink,
								score: r.data.score,
								comments: r.data.num_comments,
								author: r.data.author,
								imageURL: r.data.thumbnail != "self" ? r.data.url : null
							};
						})
					);
				});
			});
		}
	},
	class QuoteCommand extends Command {
		constructor() {
			super({
				name: "quote",
				description: "Makes a quote",
				subcommands: [
					{
						name: "message",
						args: [
							{
								errorMsg: "Please provide a valid message ID.",
								type: "function",
								testFunction: obj => obj.length >= 17 && obj.length < 19 && !isNaN(obj)
							}
						]
					},
					{
						name: "fallback",
						args: [
							{
								allowQuotes: true,
								infiniteArgs: true,
								type: "member"
							},
							{
								infiniteArgs: true,
								type: "string"
							}
						]
					}
				],
				usage: "quote <user | \"user\"> <quote> OR quote message <id>"
			});
		}

		async run(bot, message, args, flags) {
			if (args[0] == "message") {
				message.channel.fetchMessage(args[1])
					.then(msg => {
						const quoteEmbed = new RichEmbed()
							.setAuthor(msg.author.tag, msg.author.avatarURL || `https://cdn.discordapp.com/embed/avatars/${msg.author.discriminator % 5}.png`)
							.setDescription(msg.content || ((msg.embeds[0] && msg.embeds[0].description) || ""))
							.setFooter("Sent")
							.setTimestamp(msg.createdAt)
							.addField("Jump to message", `[Click or tap here](${msg.url})`);
						if (msg.member) quoteEmbed.setColor(msg.member.displayColor);
						message.channel.send(quoteEmbed);
					})
					.catch(() => message.channel.send("⚠ A message with that ID was not found in this channel."));
			} else {
				const member = args[0];
				message.channel.send(new RichEmbed()
					.setAuthor(member.user.tag, member.user.avatarURL)
					.setDescription(args[1])
					.setColor(member.displayColor)
				);
			}
		}
	},
	class RateCommand extends Command {
		constructor() {
			super({
				name: "rate",
				description: "Have the bot rate someone (or anything) for you",
				aliases: ["opinion", "ratewaifu"],
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				},
				usage: "rate <someone or something>"
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

		async run(bot, message, args, flags) {
			let toRate = args[0];
			if (toRate.toLowerCase() == bot.user.username.toLowerCase() || toRate == bot.user.tag) {
				return message.channel.send("I would rate myself a 10/10, of course.");
			}

			if (/<@!?\d+>/.test(toRate)) {
				const member = message.guild.members.get(args[0].match(/\d+/)[0]);
				toRate = member ? member.user.tag : args[0];
			} else if (toRate == "me") {
				toRate = message.author.tag;
			}
			let hash = 0;
			for (let i = 0; i < toRate.length; i++) {
				hash = hash * 31 + toRate.charCodeAt(i);
				hash |= 0; // Convert to 32-bit integer
			}

			let rating, toSend;
			if (toRate == message.author.tag || toRate == "me") {
				rating = (Math.abs(hash % 50 / 10) + 5).toFixed(1);
				toSend = "I would rate you: ";
			} else {
				rating = (Math.abs(hash % 90 / 10) + 1).toFixed(1);
				toSend = "I would rate `" + toRate + "`: ";
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
			message.channel.send(new RichEmbed()
				.setDescription(toSend + "\n" +
					"`" + "█".repeat(Math.round(rating)) + " ‍‍".repeat(10 - Math.round(rating)) + "` " + `**${rating}**/10` + "\n" +
					this.rateStates[this.rateStates.findIndex(state => state.min <= rating)].msg)
				.setColor(Math.floor(r * rMultiplier) * 65536 + Math.floor(g * rMultiplier) * 256 + Math.floor(b * rMultiplier))
			);
		}
	},
	class SayCommand extends Command {
		constructor() {
			super({
				name: "say",
				description: "Have the bot say something for you",
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				flags: [
					{
						name: "embed",
						desc: "Embeds the message"
					}
				],
				perms: {
					bot: ["MANAGE_MESSAGES"],
					user: [],
					level: 0
				},
				usage: "say <message> [--embed]"
			});
		}

		async run(bot, message, args, flags) {
			await message.delete();
			if (flags.some(f => f.name == "embed")) {
				message.channel.send(new RichEmbed()
					.setColor(Math.floor(Math.random() * 16777216))
					.setDescription(args[0])
				);
			} else {
				message.channel.send(args[0]);
			}
		}
	},
	class ShipCommand extends Command {
		constructor() {
			super({
				name: "ship",
				description: "Ships two users, or to another user if one user is provided, and generates a ship name",
				args: [
					{
						allowQuotes: true,
						infiniteArgs: true,
						type: "string"
					},
					{
						infiniteArgs: true,
						optional: true,
						type: "string"
					}
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				},
				usage: "ship <user 1 | \"user 1\"> [user 2]"
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

		async run(bot, message, args, flags) {
			if (args[0].length < 2 || (args[1] && args[1].length < 2)) return {cmdWarn: "One of the ship names is too short.", noLog: true, cooldown: null};
			const memberRegex = /<@!?\d+>/, memberRegex2 = /\d+/;
			let toShip1 = args[0], toShip2 = args[1];

			if (memberRegex.test(toShip1)) {
				const member = message.guild.members.get(args[0].match(memberRegex2)[0]);
				toShip1 = member ? member.user.username : args[0];
			}
			if (toShip2) {
				if (memberRegex.test(toShip2)) {
					const member = message.guild.members.get(args[1].match(memberRegex2)[0]);
					toShip2 = member ? member.user.username : args[1];
				}
			} else {
				toShip2 = toShip1;
				toShip1 = message.author.username;
			}

			const fullShipName = toShip1 + toShip2,
				shipName = toShip1.slice(0, Math.floor(toShip1.length / 2)) + toShip2.slice(Math.floor(toShip2.length / 2));
			let hash = 0;
			for (let i = 0; i < fullShipName.length; i++) {
				hash = hash * 31 + fullShipName.charCodeAt(i);
				hash |= 0; // Convert to 32-bit integer
			}

			const shipRating = parseFloat((Math.abs(hash % 90) / 10 + 1).toFixed(1));
			let shipDescription = "**Ship Name**: " + shipName + "\n" +
				"**Ship Rating**: `" + "█".repeat(Math.round(shipRating)) + " ‍‍".repeat(10 - Math.round(shipRating)) + "` " + `**${shipRating}**/10` + "\n" +
				this.shipStates[this.shipStates.findIndex(state => state.min <= shipRating)].msg;
			if (toShip1 == toShip2) shipDescription += "\n\n" + "*Forever alone!*";
			message.channel.send(new RichEmbed()
				.setTitle(toShip1 + " 💗 " + toShip2)
				.setColor(131073 * Math.floor(shipRating * 12.5))
				.setDescription(shipDescription)
			);
		}
	}
];