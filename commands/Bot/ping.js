const Command = require("../../structures/command.js");

class PingCommand extends Command {
	constructor() {
		super({
			name: "ping",
			description: "Get bot ping and latency",
			cooldown: {
				time: 15000,
				type: "channel"
			}
		});
	}
	
	async run(bot, message, args, flags) {
		const m = await message.channel.send("Ping?");
		m.edit(":ping_pong: **Pong!**" + "\n" + "Latency: " + (m.createdTimestamp - message.createdTimestamp) + "ms" + "\n" + "API Latency: " + Math.round(bot.ping) + "ms")
	}
}

module.exports = PingCommand;
