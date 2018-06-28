const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	var ciChnl;
	if (args.length == 0) {
		ciChnl = message.channel;
	} else {
		ciChnl = message.mentions.channels.first() || message.guild.channels.get(args[0]);
		if (!ciChnl) return message.channel.send("No channels were found! A valid channel mention or ID is needed.");
	}
	let ccDate = new Date(ciChnl.createdTimestamp);
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Channel Info - " + ciChnl.name)
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
	aliases: ["channel"],
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
	name: "channelinfo",
	category: "Utility",
	description: "Get info about a channel",
	usage: "channelinfo [channel]"
}
