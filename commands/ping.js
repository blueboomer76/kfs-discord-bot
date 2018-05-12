const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	const m = await message.channel.send("Ping?");
	m.edit(":ping_pong: Pong! | Latency: " + (m.createdTimestamp - message.createdTimestamp) + "ms | API Latency: " + Math.round(bot.ping) + "ms")
}

module.exports.help = {
	"name": "ping"
}
