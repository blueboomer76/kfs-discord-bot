module.exports.run = async (bot, message, args) => {
	if (args.length < 2) return message.channel.send("You need to provide at least two choices for me to pick from!");
	let choice = args[Math.floor(Math.random() * args.length)];
	if (choice.length > 1500) choice = choice.slice(0, 1500) + "...";
	message.channel.send("I choose: " + choice);
}

module.exports.config = {
	aliases: ["pick, select"],
	cooldown: {
		waitTime: 15000,
		type: "user"
	},
	guildOnly: true,
	perms: {
		level: 0,
		reqEmbed: false,
		reqPerms: null
	}
}

module.exports.help = {
	name: "choose",
	category: "Fun",
	description: "Have the bot choose something for you",
	usage: "choose <choice 1> <choice 2> [...]"
}
