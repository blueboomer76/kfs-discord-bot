module.exports.run = async (bot, message, args) => {
	const m = await message.channel.send("Ping?");
	m.edit(":ping_pong: Pong! | Latency: " + (m.createdTimestamp - message.createdTimestamp) + "ms | API Latency: " + Math.round(bot.ping) + "ms")
}

module.exports.config = {
	aliases: [],
	cooldown: {
		waitTime: 15000,
		type: "channel"
	},
	guildOnly: false,
	perms: {
		level: 0,
		reqEmbed: false,
		reqPerms: null
	}
}

module.exports.help = {
	name: "ping",
	category: "Bot",
	description: "Get bot ping and API latency of the bot",
	usage: "ping"
}
