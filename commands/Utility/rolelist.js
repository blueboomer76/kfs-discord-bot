const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	var rlStart;
	if (!args[0]) {
		rlStart = 0;
	} else if (isNaN(args[0]) || args[0] < 1) {
		return message.channel.send("Page provided is invalid!");
	} else {
		rlStart = args[0] - 1;
	}
	var dispRoles = [];
	let roleList = message.guild.roles.array();
	if (rlStart * 20 < roleList.length) {
		for (let i = rlStart * 20; i < roleList.length && i < rlStart * 20 + 20; i++) {
			dispRoles.push(roleList[i].name)
		}
	} else {
		return message.channel.send("No roles on this page.")
	}
	message.channel.send(new Discord.RichEmbed()
	.setTitle("List of roles in this server")
	.setColor(7713955)
	.setDescription(dispRoles.join("\n"))
	.setFooter("Page " + args[0] + " / " + Math.ceil(roleList.length / 20))
	);
}

module.exports.config = {
	aliases: ["roles"],
	cooldown: {
		waitTime: 30000,
		type: "guild"
	},
	guildOnly: true,
	perms: {
		level: 0,
		reqPerms: []
	}
}

module.exports.help = {
	name: "rolelist",
	category: "Utility",
	description: "Get the guild's roles",
	usage: "k,rolelist [page]"
}
