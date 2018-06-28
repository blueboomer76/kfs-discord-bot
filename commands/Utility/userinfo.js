const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	var uiMem;
	if (args.length == 0) {
		uiMem = message.guild.member(message.author);
	} else {
		var argstext = args.join(" ");
		uiMem = fList.findMember(bot, message, argstext);
		if (!uiMem) return message.channel.send("The user provided could not be found in this server.");
	}

	let ucDate = new Date(uiMem.user.createdTimestamp);
	let ujDate = new Date(uiMem.joinedTimestamp);
	var memNick;
	if (uiMem.nickname == null) {memNick = "None"} else {memNick = uiMem.nickname}
	let tsList = [];
	let ugMembers = message.guild.members;
	ugMembers.forEach(mem => tsList.push(mem.joinedTimestamp))
	tsList.sort((a, b) => a - b);
	
	message.channel.send(new Discord.RichEmbed()
	.setTitle("User Info for " + uiMem.user.tag)
	.setColor(uiMem.displayColor)
	.setFooter("ID: " + uiMem.id)
	.setThumbnail(uiMem.user.avatarURL)
	.addField("Account created at", ucDate.toUTCString() + " (" + fList.getDuration(ucDate) + ")")
	.addField("Joined this server at", ujDate.toUTCString() + " (" + fList.getDuration(ujDate) + ")")
	.addField("Status", uiMem.presence.status)
	.addField("Is a bot", uiMem.user.bot)
	.addField("Nickname", memNick)
	.addField("Member #", tsList.indexOf(uiMem.joinedTimestamp) + 1)
	.addField("Roles - " + uiMem.roles.array().length, uiMem.roles.array().join(", "))
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
		reqEmbed: true,
		reqPerms: null
	}
}

module.exports.help = {
	name: "userinfo",
	category: "Utility",
	description: "Get info about you, or another user",
	usage: "userinfo [user]"
}
