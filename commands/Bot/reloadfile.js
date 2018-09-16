const Command = require("../../structures/command.js");

class ReloadFileCommand extends Command {
	constructor() {
		super({
			name: "reloadfile",
			description: "Reload a file",
			args: [
				{
					num: Infinity,
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
				level: 8
			},
			usage: "reloadfile <file path>"
		});
	}
	
	async run(bot, message, args, flags) {
		try {
			delete require.cache[require.resolve(`../../${args[0]}`)];
			message.channel.send(`The file ${args[0]} was reloaded and its require.cache has been cleared.`);
		} catch (err) {
			message.channel.send(`Couldn't reload file: \`${err}\``);
		}
	}
}

module.exports = ReloadFileCommand;
