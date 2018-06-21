const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	var checkDate = new Date();
	let gcDate = new Date(message.guild.createdTimestamp);
	var botCount = 0;
	message.guild.members.forEach(bcMember => {if (bcMember.user.bot) {botCount++;}});
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Detailed server Info for " + message.guild.name)
	.setColor(Math.floor(Math.random() * 16777216))
	.setFooter("ID: " + message.guild.id + " ~ Server data as of")
	.setTimestamp(message.createdAt)
	.addField("Created at", gcDate.toUTCString() + " (" + fList.getDuration(message.guild.createdAt) + ")")
	.addField("Owner", message.guild.owner.user.tag + " (ID " + message.guild.ownerID + ")")
	.addField("Region", message.guild.region)
	.addField("Verification Level", message.guild.verificationLevel)
	.addField("Explicit Filter Level", message.guild.explicitContentFilter)
	.addField("Members [" + message.guild.memberCount + " total]",
	message.guild.presences.findAll(`status`, "online").length + " Online" + "\n" +
	botCount + " Bots",
	true)
	.addField("Roles [" + message.guild.roles.array().length + " total]", "`k,rolelist` to see all roles", true)
	.addField("Channels [" + message.guild.channels.array().length + " total]",
	message.guild.channels.findAll(`type`, "text").length + " Text" + "\n" +
	message.guild.channels.findAll(`type`, "voice").length + " Voice" + "\n" +
	message.guild.channels.findAll(`type`, "category").length + " Categories",
	true)
	);
}

module.exports.config = {
	"aliases": ["guild", "server"],
	"cooldown": {
		"waitTime": 120000,
		"type": "guild"
	},
	"guildOnly": true,
	"perms": {
		"level": 0,
		"reqPerms": null
	}
}

module.exports.help = {
	"name": "serverinfo",
	"category": "Utility",
	"description": "Get info about this server",
	"usage": "k,serverinfo"
}
