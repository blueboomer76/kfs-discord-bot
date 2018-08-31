const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class RestartCommand extends Command {
	constructor() {
		super({
			name: "restart",
			description: "Restarts the bot",
			aliases: ["reboot"],
			cooldown: {
				time: 0,
				type: "user"
			},
			perms: {
				bot: [],
				user: [],
				level: 7
			}
		});
	}
	
	async run(bot, message, args, flags) {
		message.channel.send("Restarting the bot in 10 seconds...");
		bot.logStats();
		setTimeout(() => {
			bot.destroy();
			process.exit(1);
		}, 10000)
	}
}

module.exports = RestartCommand;