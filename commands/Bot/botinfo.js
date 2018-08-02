const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Bot Info")
		.setColor(Math.floor(Math.random() * 16777216))
		.addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1048576).toFixed(2)} MB`)
		.addField("Uptime", fList.getDuration(bot.readyTimestamp))
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
	},
	commandInfo: {
		aliases: ["bot", "info"],
		args: null,
		category: "Bot",
		cooldown: {
			time: 30000,
			type: "guild"
		},
		description: "Get info about the Kendra bot",
		flags: null,
		guildOnly: false,
		name: "botinfo",
		perms: {
			bot: ["EMBED_LINKS"],
			user: null,
			level: 0,
		},
		usage: "botinfo"
	}
}