const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	var argstext = args.join(" ");
	var uiUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]) || message.guild.members.find(`nick`, argstext));
	if (args == "") {
		uiUser = message.guild.member(message.author);
	} else if (!uiUser) {
		return message.channel.send("Please mention a valid user, or provide a valid ID or name!");
	}
	let ucDate = new Date(uiUser.user.createdTimestamp);
	let ujDate = new Date(uiUser.joinedTimestamp);
	message.channel.send(new Discord.RichEmbed()
	.setTitle("User Info for " + uiUser.user.tag)
	.setColor(uiUser.displayColor)
	.setThumbnail(uiUser.user.avatarURL)
	.setFooter("ID: " + uiUser.id)
	.addField("Account created at", cDate.toUTCString() + " (" + fList.getDuration(ucDate) + ")")
	.addField("Joined this server at", jDate.toUTCString() + " (" + fList.getDuration(ujDate) + "; Join order coming soon)")
	.addField("Is a bot", uiUser.user.bot)
	.addField("Nickname", uiUser.nickname)
	.addField("Status", uiUser.presence.status)
	.addField("Roles - " + uiUser.roles.array().length, uiUser.roles.array())
	);
	/*
		Others found:
		Seen on guild(s), Join order, Is Admin, Permissions
	*/
}

module.exports.config = {
	"aliases": ["user"],
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
	"name": "userinfo",
	"category": "Utility",
	"description": "Get info about you, or another user",
	"usage": "k,userinfo [user]"
}
