const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class UnloadCommand extends Command {
	constructor() {
		super({
			name: "unload",
			description: "Unloads a command. Some commands cannot be unloaded.",
			allowDMs: true,
			args: [
				{
					num: 1,
					type: "command"
				}
			],
			cooldown: {
				time: 0,
				type: "user"
			},
			hidden: true,
			perms: {
				bot: [],
				user: [],
				level: 5
			},
			usage: "unload <command>"
		});
	}
	
	async run(bot, message, args, flags) {
		let command = args[0];
		if (command.category == "Bot" || command.name == "eval") return message.channel.send("That command is not unloadable.")
		delete require.cache[require.resolve(`../${command.category}/${command.name}.js`)];
		bot.commands.delete(args[0]);
		message.channel.send(`The command ${command.name} was unloaded.`);
	}
}

module.exports = UnloadCommand;