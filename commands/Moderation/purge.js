module.exports = {
	run: async (bot, message, args, flags) => {
		message.channel.bulkDelete(args[0] + 1, true)
		.then(messages => message.channel.send(`Deleted ${messages.size - 1} messages from the channel!`).then(m => m.delete(6000).catch(() => {})))
		.catch(() => message.channel.send("Could not purge the messages."))
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
				max: 99
			}
		],
		category: "Moderation",
		cooldown: {
			time: 20000,
			type: "user"
		},
		description: "Deletes messages from this channel",
		flags: null,
		guildOnly: true,
		name: "purge",
		perms: {
			bot: ["MANAGE_MESSAGES"],
			user: ["MANAGE_MESSAGES"],
			level: 2
		},
		usage: "purge <number>"
	}
}
