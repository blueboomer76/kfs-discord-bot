const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const {capitalize} = require("../../modules/functions.js");

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
				level: 4
			},
			usage: "load <category> <command>"
		});
	}
	
	async run(bot, message, args, flags) {
		let category = capitalize(args[0]);
		let commandName = args[1];
		try {
			let CommandClass = require(`../${category}/${commandName}.js`);
			let command = new CommandClass();
			command.category = category;
			bot.commands.set(commandName, command);
			message.channel.send(`The command ${commandName} was loaded.`);
		} catch(err) {
			message.channel.send(`A problem has occurred: \`${err}\``);
		}
	}
}

module.exports = LoadCommand;