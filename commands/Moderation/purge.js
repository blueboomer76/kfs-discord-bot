const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	let delAmount = Number(args[0])
	if (isNaN(args[0]) || args[0] < 1 || args[0] > 100) return message.reply("The number of messages to delete must be a number between 1 and 100")
	await message.channel.bulkDelete(delAmount + 1, true)
	.then(
		message.channel.send(`Deleted ${args[0]} messages from the channel!`).then(m => m.delete(5000))
	)
	.catch(err => message.channel.send("Oops! An error occurred: ```" + err + "```"))
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
		reqPerms: ["MANAGE_MESSAGES"]
	}
}

module.exports.help = {
	name: "purge",
	category: "Moderation",
	description: "Deletes messages from a channel",
	usage: "k,purge <number>"
}