const config = require("../config.json");

module.exports = async (bot, message) => {
	if (message.author.bot || !message.content.startsWith(config.prefix)) return;
	var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	var command = args.shift().toLowerCase();
	var rCommand = bot.commands.get(command);
	var e;
	if (rCommand) {
		if (message.guild && !message.channel.permissionsFor(bot.user).has("SEND_MESSAGES")) return;
		rCommand.run(bot, message, args).catch(err => {
			e = err;
			if (err && err.stack) e = err.stack;
			message.channel.send("An error has occurred while running the command:```javascript" + "\n" + e + "```");
		});
	} else {
		var rCommand2 = bot.aliases.get(command);
		if (rCommand2) {
			if (message.guild && !message.channel.permissionsFor(bot.user).has("SEND_MESSAGES")) return;
			rCommand = bot.commands.get(rCommand2);
			rCommand.run(bot, message, args).catch(err => {
				e = err;
				if (err && err.stack) e = err.stack;
				message.channel.send("An error has occurred while running the command:```javascript" + "\n" + e + "```");
			});
		}
	}
};
