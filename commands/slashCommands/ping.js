const Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js");

class PingCommand extends Command {
	constructor() {
		super({
			name: "ping",
			description: "Get bot ping and latency",
			allowDMs: true,
			cooldown: {
				time: 15000,
				type: "channel"
			}
		});
	}

	async run(ctx) {
		ctx.respond({content: "Ping?", fetchReply: true})
			.then(reply => {
				reply.edit("🏓 **Pong!**\n" +
					`Latency: ${reply.createdTimestamp - ctx.interaction.createdTimestamp}ms\n` +
					`API Latency: ${Math.round(ctx.bot.ws.ping)}ms`);
			});
	}
}

class PingCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "ping",
			description: "Get bot ping and latency",
			command: PingCommand
		});
	}
}

module.exports = PingCommandGroup;
