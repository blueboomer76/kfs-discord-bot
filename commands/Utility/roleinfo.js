const Discord = require("discord.js");
const fList = require("../../modules/functions.js")

module.exports.run = async (bot, message, args) => {
	var riRole = message.mentions.roles.first() || message.guild.roles.get(args[0]);
	var argstext = args.join(" ");
	if (args == "") {
		return message.channel.send("You must provide a role for info.");
	} else if (!riRole) {
		message.guild.roles.forEach(rsRole => { 
			if (rsRole.name == argstext) {riRole = rsRole}
		});
		if (!riRole) {
			return message.channel.send("Invalid role was provided!");
		}
	}
	let rcDate = new Date(riRole.createdTimestamp);
	var roMembers = 0;
	riRole.members.forEach(rMember => {
		if (rMember.presence.status == "online") {roMembers++;}
	})
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Role Info for " + riRole.name)
	.setColor(riRole.color)
	.setFooter("ID: " + riRole.id)
	.addField("Role created at", rcDate.toUTCString() + " (" + fList.getDuration(rcDate) + ")")
	.addField("Color", riRole.hexColor)
	.addField("Members in Role [" + riRole.members.array().length + " total]",
	roMembers + " Online",
	true)
	.addField("Position", riRole.position + "/" + message.guild.roles.array().length)
	.addField("Displays separately (hoisted)", riRole.hoist)
	.addField("Mentionable", riRole.mentionable)
	.addField("Managed", riRole.managed)
	);
}

module.exports.config = {
	"aliases": ["role"],
	"cooldown": {
		"waitTime": 15000,
		"type": "channel"
	},
	"guildOnly": true,
	"perms": {
		"level": 0,
		"reqPerms": null
	}
}

module.exports.help = {
	"name": "roleinfo",
	"category": "Utility",
	"description": "Get info about a role",
	"usage": "k,role <role>"
}
