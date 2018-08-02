module.exports = {
	run: async (bot, message, args, flags) => {
		let choices = args[0].split(" ");
		if (choices.length < 2) return message.channel.send("You need to provide at least two choices for me to pick from!");
		let choice = choices[Math.floor(Math.random() * choices.length)];
		if (choice.length > 1500) choice = choice.slice(0, 1500) + "...";
		message.channel.send("I choose: " + choice);
	},
	commandInfo: {
		aliases: ["pick, select"],
		args: [
			{
				allowQuotes: false,
				num: Infinity,
				optional: false,
				type: "string"
			},
		],
		category: "Fun",
		cooldown: {
			time: 15000,
			type: "user"
		},
		description: "Have the bot choose among a list of items",
		flags: null,
		guildOnly: true,
		name: "choose",
		perms: {
			bot: null,
			user: null,
			level: 0
		},
		usage: "choose <choice 1> <choice 2> [choices...]"
	}
}
