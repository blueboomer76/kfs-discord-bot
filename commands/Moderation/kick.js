const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	if (!message.member.hasPermission("KICK_MEMBERS")) return message.reply("You don't have the required permission `KICK_MEMBERS` to run this command!")
	let kUser = fList.findMember(message, args.join(" "));
	if (kUser == undefined) return message.channel.send("The user provided could not be found in this guild.");
	await kUser.kick()
	.then(message.channel.send(`:white_check_mark: The user ${bUser.tag} was kicked from the guild.`))
	.catch(err => message.channel.send("Oops! An error occurred: ```" + err + "```"))
}

module.exports.config = {
	aliases: [],
	cooldown: {
		waitTime: 15000,
		type: "user"
	},
	guildOnly: true,
	perms: {
		level: 2,
		reqPerms: ["KICK_MEMBERS"]
	}
}

module.exports.help = {
	name: "kick",
	category: "Moderation",
	description: "Kicks a member. It will be logged if a modlog channel was set",
	usage: "k,kick <user>"
}