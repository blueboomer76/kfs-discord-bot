const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	var d = new Date();
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Server Info for " + message.guild.name)
	.setColor(Math.floor(Math.random() * 16777216))
	.setFooter("Server data as of")
	.setTimestamp(message.createdAt)
	.addField("Created at", message.guild.createdAt)
	.addField("Server ID", message.guild.id)
	.addField("Owner", message.guild.owner + " (ID " + message.guild.ownerID + ")")
	.addField("Region", message.guild.region)
	.addField("Members", message.guild.memberCount)
	);
	/*
		Others found:
		Online members, Num Humans/Bots, Num Categories/Voice/Text Channels, Num Roles, Verification, Shard #, Default Channel, Explicit Filter
	*/
}

module.exports.help = {
	"name": "serverinfo"
}
