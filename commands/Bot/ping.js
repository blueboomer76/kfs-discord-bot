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
			level: 0
		},
		usage: "ping"
	}
}
