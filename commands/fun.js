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
						num: Infinity,
						type: "string"
					}
				]
			});
		}
		
		async run(bot, message, args, flags) {
			let magicmsgs = [
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
				message.channel.send("ðŸŽ± You need to provide an actual question...");
			} else {
				message.channel.send(`ðŸŽ± ${magicmsgs[Math.floor(Math.random() * 20)]}`);
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
				if (err) return message.channel.send(`Failed to retrieve from random.cat. (status code ${res.statusCode})`)
				message.channel.send(new Discord.RichEmbed()
				.setTitle("Here's your random cat!")
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter("From random.cat")
				.setImage(JSON.parse(res.body).file)
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
						num: Infinity,
						parseSeperately: true,
						type: "string"
					}
				],
				usage: "choose <choices...>"
			});
		}
		
		async run(bot, message, args, flags) {
			message.channel.send(`I choose: ${args[Math.floor(Math.random() * args.length)]}`);
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
				if (err) {return message.channel.send(`Failed to retrieve from random.dog. (status code ${res.statusCode})`)}
				message.channel.send(new Discord.RichEmbed()
				.setTitle("Here's your random dog!")
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter("From random.dog")
				.setImage(JSON.parse(res.body).url)
				);
			});
		}
	},
	class FlipCommand extends Command {
		constructor() {
			super({
				name: "flip",
				description: "Flip a coin. You can specify a number of coins to flip",
				aliases: ["coin"],
				args: [
					{
						num: 1,
						optional: true,
						type: "number",
						min: 1,
						max: 30
					}
				],
				usage: "flip <1-30>"
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
	class QuoteCommand extends Command {
		constructor() {
			super({
				name: "quote",
				description: "Makes a quote",
				args: [
					{
						allowQuotes: true,
						num: Infinity,
						type: "member"
					},
					{
						num: Infinity,
						type: "string"
					}
				],
				usage: "quote <user> <quote>"
			});
		}
		
		async run(bot, message, args, flags) {
			let member = args[0];
			message.channel.send(new Discord.RichEmbed()
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
				description: "Have the bot rate someone for you",
				aliases: ["opinion", "rate"],
				args: [
					{
						num: Infinity,
						type: "string"
					}
				],
				usage: "ratewaifu <someone>"
			});
		}
		
		async run(bot, message, args, flags) {
			let hash = 0;
			let memberRegex = /<@!?\d+>/;
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
			let rand = (Math.abs(hash % 90 / 10) + 1).toFixed(1), toSend;
			if (args[0].toLowerCase == "kendra" || message.mentions.users.first() == bot.user) {
				toSend = "I would rate myself a 10/10";
			} else if (message.mentions.users.first() == message.author || args[0] == message.author.tag) {
				rand = (Math.abs(hash % 50 / 10) + 5).toFixed(1);
				toSend = `I would rate you a ${rand}/10`
			} else {
				toSend = `I would rate **${args[0]}** a ${rand}/10`
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
						num: Infinity,
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
			await message.channel.bulkDelete([message.id]);
			if (flags.find(f => f.name == "embed")) {
				message.channel.send(new Discord.RichEmbed()
				.setColor(Math.floor(Math.random() * 16777216))
				.setDescription(args[0])
				)
			} else {message.channel.send(args[0])};
		}
	}
];