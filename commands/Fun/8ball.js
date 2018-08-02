module.exports = {
	run: async (bot, message, args, flags) => {
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
			message.channel.send(":8ball: You need to provide an actual question...");
		} else {
			message.channel.send(":8ball: " + magicMsgs[Math.floor(Math.random() * 20)]);
		}
	},
	commandInfo: {
		aliases: ["8b"],
		args: [
			{
				allowQuotes: false,
				num: Infinity,
				optional: false,
				type: "string"
			}
		],
		category: "Fun",
		cooldown: {
			time: 15000,
			type: "user"
		},
		description: "Ask the 8 ball a yes/no question and get an answer!",
		flags: null,
		guildOnly: true,
		name: "8ball",
		perms: {
			bot: null,
			user: null,
			level: 0
		},
		usage: "8ball <question>"
	}
}
