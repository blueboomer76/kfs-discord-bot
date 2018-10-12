const Command = require("../../structures/command.js");

class ReloadFileCommand extends Command {
	constructor() {
		super({
			name: "reloadfile",
			description: "Reload a file",
			allowDMs: true,
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
			hidden: true,
			perms: {
				bot: [],
				user: [],
				level: 5
			},
			usage: "reloadfile <file path>"
		});
	}
	
	async run(bot, message, args, flags) {
		try {
			let res = delete require.cache[require.resolve(`../../${args[0]}`)];
			if (res) {
				message.channel.send(`The file ${args[0]} was reloaded and its require.cache has been cleared.`);
			} else {
				message.channel.send("Failed to reload that file.");
			}
		} catch (err) {
			message.channel.send(`Couldn't reload file: \`${err}\``);
		}
	}
}

module.exports = ReloadFileCommand;
