const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Bot Info")
		.setColor(Math.floor(Math.random() * 16777216))
		.addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1048576).toFixed(2)} MB`)
		.addField("Last Ready", fList.getDuration(bot.readyTimestamp))
		.addField("Total Users on This Shard", bot.users.size.toLocaleString())
		.addField("Total Servers on This Shard", bot.guilds.size.toLocaleString())
		.addField("Total Channels on This Shard", bot.channels.size.toLocaleString())
		);
		/*
			Others found:
			Bot Author, Shard Number, Command Count, Msgs/Sec, Owner ID(s), Num Text/Voice Channels, Ping, Last Message,
			RAM Usage, Shard Uptime, Global Guilds, Channels, Users
			
			Ratios, Min, Max, Average of the following:
			Users/Guild
			Online Users/Guild
			Percent Online/Guild
			Text Channels/Guild
			Voice Channels/Guild
			Music Listeners/Guild
			Music Listener Percent/Guild
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
		description: "Get info about the bot",
		flags: null,
		guildOnly: false,
		name: "botinfo",
		perms: {
			bot: ["EMBED_LINKS"],
			user: null,
			level: 0
		},
		usage: "botinfo"
	}
}
