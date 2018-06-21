const Discord = require("discord.js");

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
	.setTitle("Channel Info for " + ciChnl.name)
	.setColor(Math.floor(Math.random() * 16777216))
	.setFooter("ID: " + ciChnl.id)
	.addField("Channel created at", ccDate.toUTCString())
	.addField("Channel type", ciChnl.type)
	);
	/*
		Others found:
		Can be accessed by everyone, disabled command(s) & features
	*/
}

module.exports.help = {
	"name": "channelinfo"
}
