const Command = require("../../structures/command.js");

class ShutdownCommand extends Command {
	constructor() {
		super({
			name: "shutdown",
			description: "Shuts down the bot",
			allowDMs: true,
			cooldown: {
				time: 0,
				type: "user"
			},
			hidden: true,
			perms: {
				bot: [],
				user: [],
				level: 7
			}
		});
	}
	
	async run(bot, message, args, flags) {
		message.channel.send("Shutting down the bot in 10 seconds...");
		bot.logStats();
		setTimeout(() => {
			bot.destroy();
			process.exit(0);
		}, 10000)
	}
}

module.exports = ShutdownCommand;
