const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	if (!message.member.hasPermission("MANAGE_NICKNAMES")) return message.reply("You don't have the required permission `MANAGE_NICKNAMES` to run this command!")
	let cnUser = fList.findMember(message, args.join(" "));
	if (cnUser == undefined) return message.channel.send("The user provided could not be found in this guild.");
	if (!args[1]) return message.reply("Please provide the new nickname for that user.")
	let newNick = args.slice(1).join(" ");
	await cnUser.setNickname(newNick)
	.then(message.channel.send(`Set the nickname of ${kUser.tag} to ${newNick}.`))
	.catch(err => message.channel.send("Oops! An error occurred: ```" + err + "```"))
}

module.exports.config = {
	aliases: ["changenick", "setnick"],
	cooldown: {
		waitTime: 15000,
		type: "user"
	},
	guildOnly: true,
	perms: {
		level: 2,
		reqPerms: ["MANAGE_NICKNAMES"]
	}
}

module.exports.help = {
	name: "setnickname",
	category: "Moderation",
	description: "Changes a member's nickname. It will be logged if a modlog channel was set",
	usage: "k,setnickname <user> <new nick>"
}