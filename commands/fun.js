const {RichEmbed} = require("discord.js"),
	Command = require("../structures/command.js"),
	resolver = require("../utils/objResolver.js"),
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
			if (!args[0].match(/ +/g)) {
				message.channel.send("🎱 You need to provide an actual question...");
			} else {
				message.channel.send(`🎱 ${magicMsgs[Math.floor(Math.random() * 20)]}`);
			}
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
			if (args.length < 2) return {cmdWarn: "You need to provide at least 2 choices for me to choose from!"}
			message.channel.send(`I choose: ${args[Math.floor(Math.random() * args.length)]}`);
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
			let iters = args[0] ? args[0] : 1;
			if (iters == 1) {
				let res;
				if (Math.random() < 0.5) {res = "Heads"} else {res = "Tails"}
				message.channel.send(`I flipped a coin and got ${res}`)
			} else {
				let res = [], heads = 0;
				for (let i = 0; i < iters; i++) {
					if (Math.random() < 0.5) {res.push("Heads"); heads++} else {res.push("Tails")}
				}
				message.channel.send(`I flipped ${iters} coins and got: ${res.join(", ")}` +
				`\n(${heads} heads and ${iters-heads} tails)`)
			}
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
			if (new Date() > this.lastChecked + 1000*3600 || this.cachedPosts.length == 0) {
				try {
					this.cachedPosts = await this.getJokes();
				} catch(err) {
					return {cmdWarn: err};
				}
			}
			
			let embedDesc = "", postData;
			while (embedDesc.length < 1000) {
				if (this.cachedPosts.length == 0) {
					try {
						this.cachedPosts = await this.getJokes();
					} catch(err) {
						break;
					}
				}
				
				postData = this.cachedPosts.splice(Math.floor(Math.random() * this.cachedPosts.length), 1)[0];
				let toDisplayDesc = postData.desc;
				
				if (embedDesc.length == 0 && toDisplayDesc.length >= 1500) {
					toDisplayDesc = `${toDisplayDesc}...`
				} else if (toDisplayDesc.length > 1500 - embedDesc.length && embedDesc.length > 200) {
					if (toDisplayDesc.length < 750) break;
					toDisplayDesc = `${toDisplayDesc.slice(0, 1500 - embedDesc.length)}...`
				}

				embedDesc += `**[${postData.title.replace(/&amp;/g, "&")}](https://reddit.com${postData.url})**` + "\n" +
					toDisplayDesc + "\n" +
					`- 👍 ${postData.score} | 💬 ${postData.comments}` + "\n\n";	
			}
			
			message.channel.send(new RichEmbed()
			.setTitle("Joke Time!")
			.setDescription(embedDesc)
			.setColor(Math.floor(Math.random() * 16777216))
			)
		}
		
		getJokes() {
			return new Promise((resolve, reject) => {
				request.get({
					url: "https://reddit.com/r/jokes/hot.json",
					qs: {limit: 50},
					json: true
				}, (err, res) => {
					if (err || res.statusCode >= 400) reject(`Failed to fetch from Reddit. (status code ${res.statusCode})`)
					
					this.lastChecked = Number(new Date());
					const results = res.body.data.children
						.filter(r => !r.data.stickied)
						.map(r => {
							let rDesc = r.data.selftext.replace(/&amp;/g, "&").trim();
							return {
								title: r.data.title,
								desc: rDesc.length > 1500 ? rDesc.slice(0,1500) : rDesc,
								url: r.data.permalink,
								score: r.data.score,
								comments: r.data.num_comments,
							}
						})
					resolve(results);
				})
			})
		}
	},
	class QuoteCommand extends Command {
		constructor() {
			super({
				name: "quote",
				description: "Makes a quote",
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
				usage: "quote <user> <quote>"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0];
			message.channel.send(new RichEmbed()
			.setAuthor(member.user.tag, member.user.avatarURL)
			.setColor(Math.floor(Math.random() * 16777216))
			.setDescription(args[1])
			)
		}
	},
	class RateWaifuCommand extends Command {
		constructor() {
			super({
				name: "ratewaifu",
				description: "Have the bot rate someone (or anything) for you",
				aliases: ["opinion", "rate"],
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				usage: "ratewaifu <someone or something>"
			});
		}
		
		async run(bot, message, args, flags) {
			const memberRegex = /<@!?\d+>/;
			let hash = 0, toRate = args[0];
			if (memberRegex.test(toRate)) {
				const memberRegex2 = /\d+/, member = message.guild.members.get(args[0].match(memberRegex2)[0])
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
			if (toRate.toLowerCase() == "kendra" || toRate == bot.user.tag) {
				toSend = "I would rate myself a 10/10, of course.";
			} else if (toRate == message.member.user.tag || toRate == "me") {
				rand = (Math.abs(hash % 50 / 10) + 5).toFixed(1);
				toSend = `I would rate you a ${rand}/10`
			} else {
				toSend = `I would rate \`${toRate}\` a ${rand}/10`
			}
			message.channel.send(toSend);
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
			if (flags.find(f => f.name == "embed")) {
				message.channel.send(new RichEmbed()
				.setColor(Math.floor(Math.random() * 16777216))
				.setDescription(args[0])
				)
			} else {message.channel.send(args[0])};
		}
	},
	class ShipCommand extends Command {
		constructor() {
			super({
				name: "ship",
				description: "Ship two users, generate a name, and rate it!",
				args: [
					{
						allowQuotes: true,
						infiniteArgs: true,
						type: "string"
					},
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				usage: "ship <user 1> <user 2>"
			});
		}
		
		async run(bot, message, args, flags) {
			const memberRegex = /<@!?\d+>/, memberRegex2 = /\d+/;
			let hash = 0, toShip1 = args[0], toShip2 = args[1], member;
			if (memberRegex.test(toShip1)) {
				member = message.guild.members.get(args[0].match(memberRegex2)[0])
				toShip1 = member ? member.user.username : args[0];
			}
			if (memberRegex.test(toShip2)) {
				member = message.guild.members.get(args[1].match(memberRegex2)[0])
				toShip2 = member ? member.user.username : args[1];
			}
			for (let i = 0; i < toShip1.length; i++) {
				const c = toShip1.charCodeAt(i);
				hash = hash * 31 + c;
				hash |= 0; // Convert to 32-bit integer
			}
			for (let i = 0; i < toShip2.length; i++) {
				const c = toShip2.charCodeAt(i);
				hash = hash * 31 + c;
				hash |= 0; // Convert to 32-bit integer
			}
			
			message.channel.send(`I would rate the ship between \`${toShip1}\` and \`${toShip2}\` a ${(Math.abs(hash % 90 / 10) + 1).toFixed(1)}/10`)
		}
	}
];