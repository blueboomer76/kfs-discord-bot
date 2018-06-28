const Discord = require("discord.js");
const config = require("../config.json");

module.exports = async (bot, message) => {
	if (message.author.bot || (!message.content.startsWith(config.prefix) && message.mentions.users.first() != bot.user)) return;
	var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	var command = args.shift().toLowerCase();
	var rCommand = bot.commands.get(command);
	if (rCommand) {
		rCommand.run(bot, message, args).catch(err => message.channel.send("An error occurred while trying to execute this code. ```javascript" + "\n" + err.stack + "```"));
	} else {
		var rCommand2 = bot.aliases.get(command)
		if (rCommand2) {
			rCommand = bot.commands.get(rCommand2);
			rCommand.run(bot, message, args).catch(err => message.channel.send("An error occurred while trying to execute this code. ```javascript" + "\n" + err.stack + "```"));
		}
	}
};