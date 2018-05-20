const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	if (!message.member.hasPermission("BAN_MEMBERS")) return message.reply("You don't have the required permission `BAN_MEMBERS` to run this command!")
	let bUser = message.mentions.users.first() || message.guild.members.get(args[0]);
	if (!bUser) return message.reply("Please mention a valid user or provide a valid ID!")
	await bUser.ban()
	.then(message.channel.send(`The user ${bUser.tag} was banned from the guild.`))
	.catch(err => message.channel.send("Oops! An error occurred: ```" + err + "```"))
}

module.exports.config = {
	"aliases": null,
	"cooldown": {
		"waitTime": 15000,
		"type": "user"
	},
	"guildOnly": true,
	"perms": {
		"level": 3,
		"reqPerms": "BAN_MEMBERS"
	}
}

module.exports.help = {
	"name": "ban",
	"category": "Moderation",
	"description": "Bans a member. It will be logged if a modlog channel was set",
	"usage": "k,ban <user>"
}