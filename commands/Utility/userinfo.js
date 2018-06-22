const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	var uiMem;
	if (args.length == 0) {
		uiMem = message.guild.member(message.author);
	} else {
		var mention = message.mentions.members.first();
		if (mention) {
			uiMem = mention;
		} else {
			uiMem = message.guild.members.get(args[0]);
		}
		if (!uiMem) return message.channel.send("No users were found! A valid user mention or ID is needed.");
	}
	var uiRoles = [];
	uiMem.roles.forEach(r => uiRoles.push(r.name));
	var roleList = uiRoles.join(", ");
	if (roleList.length > 1000) roleList = roleList.slice(0, 1000) + "...";
	let ucDate = new Date(uiMem.user.createdTimestamp);
	let ujDate = new Date(uiMem.joinedTimestamp);
	message.channel.send(new Discord.RichEmbed()
	.setTitle("User Info for " + uiMem.user.tag)
	.setColor(uiMem.displayColor)
	.setFooter("ID: " + uiMem.id)
	.setThumbnail(uiMem.user.avatarURL)
	.addField("Account created at", ucDate.toUTCString() + " (" + fList.getDuration(ucDate) + ")")
	.addField("Joined this server at", ujDate.toUTCString() + " (" + fList.getDuration(ujDate) + ")")
	.addField("Status", uiMem.presence.status)
	.addField("Is a bot", uiMem.user.bot)
	.addField("Nickname", uiMem.nickname)
	.addField("Roles - " + uiMem.roles.array().length, roleList)
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
		"reqEmbed": true,
		"reqPerms": null
	}
}

module.exports.help = {
	"name": "userinfo",
	"category": "Utility",
	"description": "Get info about you, or another user",
	"usage": "userinfo [user]"
}
