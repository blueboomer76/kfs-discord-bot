module.exports.run = async (bot, message, args) => {
	if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You don't have the required permission `MANAGE_MESSAGES` to run this command!")
	let delAmount = Math.floor(args[0]);
	if (isNaN(args[0]) || args[0] < 1 || args[0] > 99) return message.channel.send("The number of messages to delete must be a number between 1 and 99")
	message.channel.bulkDelete(delAmount + 1, true)
	.then(messages => message.channel.send(`Deleted ${messages.size - 1} messages from the channel!`).then(m => m.delete(5000)))
	.catch(() => message.channel.send("Could not purge the messages."))
}

module.exports.config = {
	aliases: ["prune", "clear"],
	cooldown: {
		waitTime: 15000,
		type: "user"
	},
	guildOnly: true,
	perms: {
		level: 2,
		reqEmbed: false,
		reqPerms: "MANAGE_MESSAGES"
	}
}

module.exports.help = {
	name: "purge",
	category: "Moderation",
	description: "Deletes messages from this channel",
	usage: "purge <number>"
}
