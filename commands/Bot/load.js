const Command = require("../../structures/command.js");

class LoadCommand extends Command {
	constructor() {
		super({
			name: "load",
			description: "Loads a command",
			allowDMs: true,
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
			hidden: true,
			perms: {
				bot: [],
				user: [],
				level: 7
			},
			usage: "load <category> <command>"
		});
	}
	
	async run(bot, message, args, flags) {
		let category = args[0].charAt(0).toUpperCase() + args[0].slice(1).toLowerCase();
		let commandName = args[1].toLowerCase();
		try {
			delete require.cache[require.resolve(`../${category}/${commandName}.js`)];
			let CommandClass = require(`../${category}/${commandName}.js`);
			let command = new CommandClass();
			command.category = category;
			bot.commands.set(commandName, command);
			if (command.aliases.length > 0) {
				for (const alias of command.aliases) bot.aliases.set(alias, command.name);
			}
			message.channel.send(`The command ${commandName} was loaded.`);
		} catch(err) {
			message.channel.send(`A problem has occurred: \`${err}\``);
		}
	}
}

module.exports = LoadCommand;
