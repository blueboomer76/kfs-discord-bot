const Discord = require("discord.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		await message.channel.bulkDelete(args[0] + 1, true)
		.then(
			message.channel.send(`Deleted ${args[0]} messages from the channel!`).then(m => m.delete(6000))
		)
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	},
	commandInfo: {
		aliases: ["prune", "clear"],
		args: [
			{
				allowQuotes: false,
				num: 1,
				optional: false,
				type: "number",
				min: 1,
				max: 100
			}
		],
		category: "Moderation",
		cooldown: {
			time: 20000,
			type: "user"
		},
		description: "Deletes messages from a channel",
		flags: [
			{
				name: "user",
				argsType: "user"
			},
		],
		guildOnly: true,
		name: "purge",
		perms: {
			bot: ["MANAGE_MESSAGES"],
			user: ["MANAGE_MESSAGES"],
			level: 2,
		},
		usage: "purge <number>"
	}
}

// Deprecated command info
module.exports.config = {
	aliases: ["prune", "clear"],
	cooldown: {
		waitTime: 15000,
		type: "user"
	},
	guildOnly: true,
	perms: {
		level: 2,
		reqPerms: "MANAGE_MESSAGES"
	}
}

module.exports.help = {
	name: "purge",
	category: "Moderation",
	description: "Deletes messages from a channel",
	usage: "k,purge <number>"
}