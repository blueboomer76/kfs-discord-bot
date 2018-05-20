const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	if (!message.member.hasPermission("KICK_MEMBERS")) return message.reply("You don't have the required permission `KICK_MEMBERS` to run this command!")
	let kUser = message.mentions.users.first() || message.guild.members.get(args[0]);
	if (!kUser) return message.reply("Please mention a valid user or provide a valid ID!")
	await kUser.kick()
	.then(message.channel.send(`The user ${kUser.tag} was kicked from the guild.`))
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
		"level": 2,
		"reqPerms": "KICK_MEMBERS"
	}
}

module.exports.help = {
	"name": "kick",
	"category": "Moderation",
	"description": "Kicks a member. It will be logged if a modlog channel was set",
	"usage": "k,kick <user>"
}