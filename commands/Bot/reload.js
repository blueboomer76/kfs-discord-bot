const Command = require("../../structures/command.js");

class ReloadCommand extends Command {
	constructor() {
		super({
			name: "reload",
			description: "Reload a command. It must be a command that is already loaded",
			args: [
				{
					num: 1,
					type: "command"
				}
			],
			category: "Bot",
			cooldown: {
				time: 0,
				type: "user"
			},
			perms: {
				bot: [],
				user: [],
				level: 7
			},
			usage: "reload <command>"
		});
	}
	
	async run(bot, message, args, flags) {
		let command = args[0];
		let commandName = command.name;
		let category = command.category;
		try {
			delete require.cache[require.resolve(`../${category}/${commandName}.js`)];
			let CommandClass = require(`../${category}/${commandName}.js`);
			let command = new CommandClass();
			command.category = category;
			bot.commands.set(commandName, command);
			message.channel.send(`The command ${commandName} was reloaded.`);
		} catch (err) {
			message.channel.send("An error has occurred: ```javascript" + "\n" + err + "```");
		}
	}
}

module.exports = ReloadCommand;
