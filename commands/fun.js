const Discord = require("discord.js");
const Command = require("../structures/command.js");
const request = require("request");

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
			let magicMsgs = [
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
			]
			if (!args[0].match(/ +/g)) {
				message.channel.send("🎱 You need to provide an actual question...");
			} else {
				message.channel.send(`🎱 ${magicMsgs[Math.floor(Math.random() * 20)]}`);
			}
		}
	},
	class CatCommand extends Command {
		constructor() {
			super({
				name: "cat",
				description: "Get a random cat!",
				aliases: ["kitten", "meow"],
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
			request.get("http://aws.random.cat/meow", (err, res) => {
				if (err) return message.channel.send(`Could not request to random.cat: ${err.message}`);
				if (!res) return message.channel.send("No response was received from random.cat.");
				if (res.statusCode >= 400) return message.channel.send(`The request to random.cat failed with status code ${res.statusCode} (${res.statusMessage})`);
				message.channel.send(new Discord.RichEmbed()
				.setTitle("Here's your random cat!")
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter("From random.cat")
				.setImage(JSON.parse(res.body).file)
				);
			})
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
			if (args.length < 2) return message.channel.send("You need to provide at least 2 choices for me to choose from!");
			message.channel.send(`I choose: ${args[Math.floor(Math.random() * args.length)]}`);
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
	class DogCommand extends Command {
		constructor() {
			super({
				name: "dog",
				description: "Get a random dog!",
				aliases: ["puppy", "woof"],
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
			request.get("http://random.dog/woof.json", (err, res) => {
				if (err) return message.channel.send(`Could not request to random.dog: ${err.message}`);
				if (!res) return message.channel.send("No response was received from random.dog.");
				if (res.statusCode >= 400) return message.channel.send(`The request to random.dog failed with status code ${res.statusCode} (${res.statusMessage})`);
				message.channel.send(new Discord.RichEmbed()
				.setTitle("Here's your random dog!")
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter("From random.dog")
				.setImage(JSON.parse(res.body).url)
				);
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
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				},
				usage: "quote <user> <quote>"
			});
		}
		
		async run(bot, message, args, flags) {
			let member = args[0];
			message.channel.send(new Discord.RichEmbed()
			.setDescription(args[1])
			.setAuthor(member.user.tag, member.user.avatarURL)
			.setColor(Math.floor(Math.random() * 16777216))
			)
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
			let hash = 0, memberRegex = /<@!?\d+>/;
			if (memberRegex.test(args[0])) {
				let memberRegex2 = /\d+/;
				let member = message.guild.members.get(args[0].match(memberRegex2)[0])
				args[0] = member ? member.user.tag : args[0];
			}
			for (let i = 0; i < args[0].length; i++) {
				let c = args[0].charCodeAt(i);
				hash = hash * 31 + c;
				hash |= 0; // Convert to 32-bit integer
			}
			let rand = (Math.abs(hash % 90 / 10) + 1).toFixed(1);
			let toSend;
			if (args[0].toLowerCase() == bot.user.username.toLowerCase() || args[0] == bot.user.tag) {
				toSend = "I would rate myself a 10/10";
			} else if (args[0] == message.author.tag || args[0].toLowerCase() == "me") {
				rand = (Math.abs(hash % 50 / 10) + 5).toFixed(1);
				toSend = `I would rate you a ${rand}/10`;
			} else {
				toSend = `I would rate **${args[0]}** a ${rand}/10`;
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
			message.delete();
			if (flags.find(f => f.name == "embed")) {
				if (!message.guild.me.hasPermission("EMBED_LINKS")) return message.channel.send("To post an embed, the bot requires the `Embed Links` permission.")
				message.channel.send(new Discord.RichEmbed()
				.setColor(Math.floor(Math.random() * 16777216))
				.setDescription(args[0])
				)
			} else {
				message.channel.send(args[0]);
			}
		}
	}
];
