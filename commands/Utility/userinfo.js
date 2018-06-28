const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	var argstext = args.join(" ");
	var uiUser = fList.findMember(message, argstext)
	if (args == "") {
		uiUser = message.guild.member(message.author);
	} else if (uiUser == undefined) {
		return message.channel.send("The user provided could not be found in this guild.");
	}
	
	var uNick;
	
	let tsList = [];
	let ugMembers = message.guild.members;
	ugMembers.forEach(mem => {
		tsList.push(mem.joinedTimestamp);
	})
	tsList.sort(function(a, b){return a-b});
	
	if (uiUser.nickname == null) {
		uNick = "None"
	} else {
		uNick = uiUser.nickname
	}
	let ucDate = new Date(uiUser.user.createdTimestamp);
	let ujDate = new Date(uiUser.joinedTimestamp);
	message.channel.send(new Discord.RichEmbed()
	.setTitle("User Info - " + uiUser.user.tag)
	.setColor(uiUser.displayColor)
	.setThumbnail(uiUser.user.avatarURL)
	.setFooter("ID: " + uiUser.id)
	.addField("Account created at", ucDate.toUTCString() + " (" + fList.getDuration(ucDate) + ")")
	.addField("Joined this server at", ujDate.toUTCString() + " (" + fList.getDuration(ujDate) + ")")
	.addField("Is a bot", uiUser.user.bot)
	.addField("Nickname", uNick)
	.addField("Status", uiUser.presence.status)
	.addField("Member #", tsList.indexOf(uiUser.joinedTimestamp) + 1)
	.addField("Roles - " + (uiUser.roles.array().length - 1), uiUser.roles.array().shift().toString().replace(/\,/g, "\, "))
	);
	/*
		Others found:
		Seen on guild(s), Is Admin, Permissions
	*/
}

module.exports.config = {
	aliases: ["user"],
	cooldown: {
		waitTime: 15000,
		type: "channel"
	},
	guildOnly: true,
	perms: {
		level: 0,
		reqPerms: []
	}
}

module.exports.help = {
	name: "userinfo",
	category: "Utility",
	description: "Get info about you, or another user",
	usage: "k,userinfo [user]"
}
