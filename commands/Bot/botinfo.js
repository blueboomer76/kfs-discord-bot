const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Bot Info")
	.setColor(Math.floor(Math.random() * 16777216))
	.addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1048576).toFixed(2)} MB`)
	.addField("Uptime", fList.getDuration(bot.uptime))
	.addField("Total Users on This Shard", bot.users.size.toLocaleString())
	.addField("Total Servers on This Shard", bot.guilds.size.toLocaleString())
	.addField("Total Channels on This Shard", bot.channels.size.toLocaleString())
	);
	/*
		Others found:
		Bot Author, Shard Number, Command Count, Msgs/Sec, Owner ID(s), Num Text/Voice Channels, Ping, Last Message,
		RAM Usage, Shard Uptime, Global Guilds, Channels, Users
		
		Ratios, Min, Max, Average:
		Users/Guild
		Online Users/Guild
		Pct Online/Guild
		Text Chnls/Guild
		Voice Chnls/Guild
		Music Listeners/Guild
		ML Pct/Guild
		Music Connections/Guild
		Queue Size
		Big servers
		Being the only bot in a server
	*/
}

module.exports.config = {
	aliases: ["bot"],
	cooldown: {
		waitTime: 15000,
		type: "guild"
	},
	guildOnly: false,
	perms: {
		level: 0,
		reqPerms: []
	}
}

module.exports.help = {
	name: "botinfo",
	category: "Bot",
	description: "Get info about the Kendra bot",
	usage: "k,botinfo"
}