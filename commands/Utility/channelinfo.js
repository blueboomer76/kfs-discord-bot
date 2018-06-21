const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	var ciChnl = message.guild.channels.get(message.mentions.channels.first().id || args[0]);
	var argstext = args.join(" ");
	if (args == "") {
		ciChnl = message.guild.channels.get(message.channel.id);
	} else if (!ciChnl) {
		return message.channel.send("Please mention a valid channel or provide a valid ID!");
	}
	let ccDate = new Date(ciChnl.createdTimestamp);
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Channel Info for #" + ciChnl.name)
	.setColor(Math.floor(Math.random() * 16777216))
	.setFooter("ID: " + ciChnl.id)
	.addField("Channel created at", ccDate.toUTCString() + " (" + fList.getDuration(ccDate) + ")")
	.addField("Channel type", ciChnl.type)
	);
	/*
		Others found:
		Can be accessed by everyone, disabled command(s) & features
	*/
}

module.exports.config = {
	"aliases": ["channel"],
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
	"name": "channelinfo",
	"category": "Utility",
	"description": "Get info about a channel",
	"usage": "k,channelinfo [channel]"
}
