const Discord = require("discord.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		const m = await message.channel.send("Ping?");
		m.edit(":ping_pong: **Pong!**" + "\n" + "Latency: " + (m.createdTimestamp - message.createdTimestamp) + "ms" + "\n" + "API Latency: " + Math.round(bot.ping) + "ms")
	},
	commandInfo: {
		aliases: [],
		args: null,
		category: "Bot",
		cooldown: {
			time: 15000,
			type: "channel"
		},
		description: "Get bot ping and API latency of the bot",
		flags: null,
		guildOnly: false,
		name: "ping",
		perms: {
			bot: null,
			user: null,
			level: 0,
		},
		usage: "ping"
	}
}

// Deprecated command info
module.exports.config = {
	aliases: [],
	cooldown: {
		waitTime: 15000,
		type: "channel"
	},
	guildOnly: false,
	perms: {
		level: 0,
		reqPerms: null
	}
}

module.exports.help = {
	name: "ping",
	category: "Bot",
	description: "Get bot ping and API latency of the bot",
	usage: "k,ping"
}