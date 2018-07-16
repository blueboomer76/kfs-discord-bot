const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	let arUser = fList.findMember(message, args.join(" "));
	if (arUser == undefined) return message.channel.send("The user provided could not be found in this guild.");
	if (!args[1]) return message.reply("Please provide the role to add for that user.")
	let arRole = args.slice(1).join(" ");
	arRole = message.guild.roles.find("name", arRole);
	await arUser.addRole(arRole)
	.then(message.channel.send(`Role ${arRole.name} has been added to ${arUser.tag}.`))
	.catch(err => message.channel.send("Oops! An error occurred: ```" + err + "```"))
}

module.exports.config = {
	aliases: ["ar", "giverole", "setrole"],
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
	name: "addrole",
	category: "Moderation",
	description: "Adds a role to a user. It will be logged if a modlog channel was set",
	usage: "k,addrole <user> <role>"
}