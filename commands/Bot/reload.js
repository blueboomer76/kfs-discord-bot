const Discord = require("discord.js");

module.exports.run = (bot, message, args) => {
	if (!args || args.size < 2) return message.reply("You must provide a category and a command in that category to reload.");
	try {
		delete require.cache[require.resolve(`../${args[0]}/${args[1]}.js`)];
		message.channel.send(`The command ${args[1]} was reloaded.`);
	} catch(err) {
		message.channel.send("An error occurred. You either provided an nonexistant category or command or the bot encountered an error.");
	}
};

module.exports.config = {
	"aliases": null,
	"cooldown": {
		"waitTime": 15000,
		"type": "global"
	},
	"guildOnly": false,
	"perms": {
		"level": 9,
		"reqPerms": null
	}
}

module.exports.help = {
	"name": "reload",
	"category": "Bot",
	"description": "Reload a command. It must be a command that has been loaded when the bot was started.",
	"usage": "k,reload <category> <command>"
}
