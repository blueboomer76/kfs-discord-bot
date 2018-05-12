const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	let gcDate = new Date(message.guild.createdAt);
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Server Info for " + message.guild.name)
	.setColor(Math.floor(Math.random() * 16777216))
	.setFooter("ID: " + message.guild.id + " | Server data as of")
	.setTimestamp(message.createdAt)
	.addField("Created at", gcDate.toUTCString())
	.addField("Owner", message.guild.owner.user.tag + " (ID " + message.guild.owner.id + ")")
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
