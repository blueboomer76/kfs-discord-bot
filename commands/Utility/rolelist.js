const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	var rlStart;
	if (!args[0]) {
		rlStart = 0
	} else if (isNaN(args[0]) || args[0] < 1) {
		return message.channel.send("Page provided is invalid!")
	} else {
		rlStart = args[0];
	}
	var rlCount = 0;
	var dispRoles = [];
	let roleList = message.guild.roles.array();
	if (rlStart > 1) {
		try {roleList.slice(rlStart * 20);} catch (err) {return message.channel.send("No roles found on this page.")}
	}
	while (rlCount < 20 && roleList[rlCount]) {
		dispRoles.push(roleList[rlCount] + "\n")
		rlCount++;
	}
	message.channel.send(new Discord.RichEmbed()
	.setTitle("List of roles in this server")
	.setColor(Math.floor(Math.random() * 16777216))
	.setDescription(dispRoles.toString())
	);
}

module.exports.config = {
	"aliases": ["roles"],
	"cooldown": {
		"waitTime": 30000,
		"type": "guild"
	},
	"guildOnly": true,
	"perms": {
		"level": 0,
		"reqPerms": null
	}
}

module.exports.help = {
	"name": "rolelist",
	"category": "Utility",
	"description": "Get the guild's roles",
	"usage": "k,rolelist [page]"
}
