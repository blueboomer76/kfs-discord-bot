const {RichEmbed} = require("discord.js"),
	Command = require("../structures/command.js"),
	request = require("request");

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
			if (new Date() > this.lastChecked + 1000*7200 || this.cachedPosts.length == 0) {
				try {
					this.cachedPosts = await this.getAntiJokes();
				} catch(err) {
					return {cmdWarn: err};
				}
			}
			
			const postData = this.cachedPosts.splice(Math.floor(Math.random() * this.cachedPosts.length), 1)[0];
			message.channel.send(new RichEmbed()
				.setTitle(postData.title.length > 250 ? `${postData.title.slice(0, 250)}...` : postData.title)
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
					if (err) return reject(`Could not request to Reddit: ${err.message}`);
					if (!res) return reject("No response was received from Reddit.");
					if (res.statusCode >= 400) return reject(`The request to Reddit failed with status code ${res.statusCode} (${res.statusMessage})`);
					
					this.lastChecked = Date.now();
					const results = res.body.data.children
						.filter(r => !r.data.stickied)
						.map(r => {
							const rCrossposts = r.data.crosspost_parent_list,
								rDesc = r.data.selftext || (rCrossposts ? (rCrossposts[0].selftext || "") : "");
							return {
								title: r.data.title,
								desc: rDesc.length > 2000 ? `${rDesc.slice(0, 2000)}...` : rDesc,
								url: r.data.permalink,
								score: r.data.score,
								comments: r.data.num_comments,
								author: r.data.author
							};
						});
					resolve(results);
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
				const requestRes = bot.checkRemoteRequest("Cat Facts API", err, res);
				if (requestRes != true) return message.channel.send(requestRes);
				
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
				description: "Have the bot choose among a list of items",
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
			if (args.length < 2) return {cmdWarn: "You need to provide at least 2 choices for me to choose from!"};
			message.channel.send(`I choose: **${args[Math.floor(Math.random() * args.length)]}**`);
		}
	},
	class CoinCommand extends Command {
		constructor() {
			super({
				name: "coin",
				description: "Flip a coin. You can specify a number of coins to flip",
				aliases: ["coinflip", "flipcoin"],
				args: [
					{
						optional: true,
						type: "number",
						min: 1,
						max: 50
					}
				],
				usage: "coin [1-50]"
			});
		}
	
		async run(bot, message, args, flags) {
			const iters = args[0] || 1;
			if (iters == 1) {
				let res;
				if (Math.random() < 0.5) {res = "Heads"} else {res = "Tails"}
				message.channel.send("I flipped a coin and got " + res);
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
				const requestRes = bot.checkRemoteRequest("Dog Facts API", err, res);
				if (requestRes != true) return message.channel.send(requestRes);
				
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
			if (new Date() > this.lastChecked + 1000*7200 || this.cachedPosts.length == 0) {
				try {
					this.cachedPosts = await this.getJokes();
				} catch(err) {
					return {cmdWarn: err};
				}
			}

			let embedDesc = "", postData;
			while (embedDesc.length < 1500) {
				if (this.cachedPosts.length < 5) {
					try {
						this.cachedPosts = await this.getJokes();
					} catch(err) {
						break;
					}
				}

				postData = this.cachedPosts.splice(Math.floor(Math.random() * this.cachedPosts.length), 1)[0];

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
							this.cachedPosts.push(postData);
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
					if (err) return reject(`Could not request to Reddit: ${err.message}`);
					if (!res) return reject("No response was received from Reddit.");
					if (res.statusCode >= 400) return reject(`The request to Reddit failed with status code ${res.statusCode} (${res.statusMessage})`);
					
					this.lastChecked = Date.now();
					const results = res.body.data.children
						.filter(r => !r.data.stickied && !r.data.over_18)
						.map(r => {
							return {
								title: r.data.title,
								desc: r.data.selftext.trim().slice(0, 1500),
								id: r.data.id,
								score: r.data.score,
								comments: r.data.num_comments
							};
						});
					resolve(results);
				});
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
			if (new Date() > this.lastChecked + 1000*7200 || this.cachedPosts.length == 0) {
				try {
					this.cachedPosts = await this.getPuns();
				} catch(err) {
					return {cmdWarn: err};
				}
			}
			
			const postData = this.cachedPosts.splice(Math.floor(Math.random() * this.cachedPosts.length), 1)[0],
				punEmbed = new RichEmbed()
					.setTitle(postData.title.length > 250 ? `${postData.title.slice(0, 250)}...` : postData.title)
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
					if (err) return reject(`Could not request to Reddit: ${err.message}`);
					if (!res) return reject("No response was received from Reddit.");
					if (res.statusCode >= 400) return reject(`The request to Reddit failed with status code ${res.statusCode} (${res.statusMessage})`);
					
					this.lastChecked = Date.now();
					const results = res.body.data.children
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
						});
					resolve(results);
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
								errorMsg: "You need to provide a valid message ID.",
								type: "function",
								testFunction: obj => /^\d{17,19}$/.test(obj)
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
						],
					}
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				},
				usage: "quote <user> <quote> OR quote message <ID>"
			});
		}
		
		async run(bot, message, args, flags) {
			if (args[0] == "message") {
				message.channel.fetchMessage(args[1])
					.then(msg => {
						const quoteEmbed = new RichEmbed()
							.setDescription(msg.content)
							.setAuthor(msg.author.tag, msg.author.avatarURL || `https://cdn.discordapp.com/embed/avatars/${msg.author.discriminator % 5}.png`)
							.setFooter("Sent")
							.setTimestamp(msg.createdAt)
							.addField("Jump to message", `[Click or tap here](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${msg.id})`);
						if (msg.member) quoteEmbed.setColor(msg.member.displayColor);
						message.channel.send(quoteEmbed);
					})
					.catch(() => message.channel.send("⚠ A message with that ID was not found in this channel."));
			} else {
				const member = args[0];
				message.channel.send(new RichEmbed()
					.setDescription(args[1])
					.setAuthor(member.user.tag, member.user.avatarURL)
					.setColor(member.displayColor)
				);
			}
		}
	},
	class RateCommand extends Command {
		constructor() {
			super({
				name: "rate",
				description: "Have the bot rate someone or something for you",
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				usage: "rate <someone or something>"
			});
		}
		
		async run(bot, message, args, flags) {
			const memberRegex = /<@!?\d+>/;
			let hash = 0, toRate = args[0];
			if (memberRegex.test(toRate)) {
				const memberRegex2 = /\d+/, member = message.guild.members.get(args[0].match(memberRegex2)[0]);
				toRate = member ? member.user.tag : args[0];
			} else if (toRate == "me") {
				toRate = message.member.user.tag;
			}
			for (let i = 0; i < toRate.length; i++) {
				const c = toRate.charCodeAt(i);
				hash = hash * 31 + c;
				hash |= 0; // Convert to 32-bit integer
			}

			let rand = (Math.abs(hash % 90 / 10) + 1).toFixed(1), toSend;
			if (toRate.toLowerCase() == bot.user.username.toLowerCase() || toRate == bot.user.tag) {
				return message.channel.send("I would rate myself a 10/10, of course.");
			} else if (toRate == message.author.tag || toRate.toLowerCase() == "me") {
				rand = (Math.abs(hash % 50 / 10) + 5).toFixed(1);
				toSend = "I would rate you: ";
			} else {
				toSend = `I would rate \`${toRate}\`: `;
			}
			rand = parseFloat(rand);
			message.channel.send(toSend + "\n" + "`" + "█".repeat(Math.floor(rand + 0.5)) + " ‍‍".repeat(10 - Math.floor(rand + 0.5)) + "` " +
			`**${rand}**/10 `);
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
				if (!message.guild.me.hasPermission("EMBED_LINKS")) return {cmdWarn: "To post an embed, the bot requires the `Embed Links` permission."};
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
				usage: "ship <user 1> [user 2]"
			});
			this.shipStates = [
				{max: 10, msg: "PERFECT!"},
				{max: 9.5, msg: "Almost Perfect!"},
				{max: 8, msg: "Great!"},
				{max: 6, msg: "Good!"},
				{max: 4, msg: "About Average"},
				{max: 2, msg: "Below Average"},
				{max: 0, msg: "Not a Match!"},
			];
		}
		
		async run(bot, message, args, flags) {
			if (args[0].length < 2 || (args[1] && args[1].length < 2)) return {cmdWarn: "One of the ship names is too short."};
			const memberRegex = /<@!?\d+>/, memberRegex2 = /\d+/;
			let hash = 0, toShip1 = args[0], toShip2 = args[1], member;

			if (memberRegex.test(toShip1)) {
				member = message.guild.members.get(args[0].match(memberRegex2)[0]);
				toShip1 = member ? member.user.username : args[0];
			}
			if (toShip2) {
				if (memberRegex.test(toShip2)) {
					member = message.guild.members.get(args[1].match(memberRegex2)[0]);
					toShip2 = member ? member.user.username : args[1];
				}
			} else {
				toShip2 = toShip1;
				toShip1 = message.author.username;
			}

			const shipName = toShip1.slice(0, Math.floor(toShip1.length / 2)) + toShip2.slice(Math.floor(toShip2.length / 2));
			for (let i = 0; i < toShip1.length; i++) {
				hash = hash * 31 + toShip1.charCodeAt(i);
				hash |= 0; // Convert to 32-bit integer
			}
			for (let i = 0; i < toShip2.length; i++) {
				hash = hash * 31 + toShip1.charCodeAt(i);
				hash |= 0; // Convert to 32-bit integer
			}

			const shipRating = parseFloat((Math.abs(hash % 90) / 10 + 1).toFixed(1));
			let shipDescription = `**Ship Name**: ${shipName}` + "\n" +
				"**Ship Rating**:" + "\n\n" +
				"`" + "█".repeat(Math.floor(shipRating + 0.5)) + " ‍‍".repeat(10 - Math.floor(shipRating + 0.5)) + "` " +
				`**${shipRating}**/10 | ` + this.shipStates[this.shipStates.findIndex(state => state.max <= shipRating)].msg;
			if (toShip1 == toShip2) shipDescription += "\n\n" + "*Forever alone!*";
			message.channel.send(new RichEmbed()
				.setTitle(`${toShip1} 💗 ${toShip2}`)
				.setColor(131073 * Math.floor(shipRating * 12.5))
				.setDescription(shipDescription)
			);
		}
	}
];
