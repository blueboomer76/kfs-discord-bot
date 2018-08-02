const Discord = require("discord.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		message.channel.send("I choose: " + args[Math.floor(Math.random() * args.length)]);
	},
	commandInfo: {
		aliases: ["changenick", "setnick"],
		args: [
			{
				allowQuotes: false,
				num: Infinity,
				optional: false,
				type: "string"
			},
		],
		category: "Moderation",
		cooldown: {
			time: 15000,
			type: "user"
		},
		description: "Have the bot choose among a list of items",
		flags: null,
		guildOnly: false,
		name: "choose",
		perms: {
			bot: null,
			user: null,
			level: 0,
		},
		usage: "choose <choice 1> <choice 2> [choices...]"
	}
};