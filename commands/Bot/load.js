const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class LoadCommand extends Command {
	constructor() {
		super({
			name: "load",
			description: "Loads a command",
			args: [
				{
					num: 1,
					type: "string"
				},
				{
					num: 1,
					type: "string"
				}
			],
			cooldown: {
				time: 0,
				type: "user"
			},
			perms: {
				bot: [],
				user: [],
				level: 7
			},
			usage: "load <command>"
		});
	}
	
	async run(bot, message, args, flags) {
		let category = args[0];
		let commandName = args[1];
		try {
			let CommandClass = require(`../${category}/${commandName}.js`);
			let command = new CommandClass();
			command.category = category;
			bot.commands.set(commandName, command);
			message.channel.send(`The command ${commandName} was loaded.`);
		} catch(err) {
			message.channel.send("A problem has occurred: ```javascript " + err + "```");
		}
	}
}

module.exports = LoadCommand;