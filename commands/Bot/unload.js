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
				level: 7
			},
			usage: "unload <command>"
		});
	}
	
	async run(bot, message, args, flags) {
		let command = args[0];
		let commandName = command.name;
		if (command.category == "Bot" || commandName == "eval") return message.channel.send("That command is not unloadable.");
		delete require.cache[require.resolve(`../${command.category}/${commandName}.js`)];
		bot.commands.delete(commandName);
		message.channel.send(`The command ${commandName} was unloaded.`);
	}
}

module.exports = UnloadCommand;
