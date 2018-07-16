const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	let rrUser = fList.findMember(message, args.join(" "));
	if (rrUser == undefined) return message.channel.send("The user provided could not be found in this guild.");
	if (!args[1]) return message.reply("Please provide the role to add for that user.")
	let rrRole = args.slice(1).join(" ");
	rrRole = message.guild.roles.find("name", rrRole);
	await rrUser.removeRole(rrRole)
	.then(message.channel.send(`Role ${rrRole.name} has been removed from ${rrUser.tag}.`))
	.catch(err => message.channel.send("Oops! An error occurred: ```" + err + "```"))
}

module.exports.config = {
	aliases: ["rr", "takerole"],
	cooldown: {
		waitTime: 15000,
		type: "user"
	},
	guildOnly: true,
	perms: {
		level: 2,
		reqPerms: ["MANAGE_ROLES"]
	}
}

module.exports.help = {
	name: "removerole",
	category: "Moderation",
	description: "Removes a role a user has. It will be logged if a modlog channel was set",
	usage: "k,removerole <user> <role>"
}