const config = require("../../config.json");

module.exports.run = async (bot, message, args) => {
	if (config.ownerIDs.indexOf(message.author.id) == -1) return message.channel.send("This command has restricted access.");
	if (args.length == 0) return message.channel.send("You must provide a command to reload.");
	var cmd = args[0].toLowerCase();
	try {
		let category = bot.commands.get(cmd).help.category;
		delete require.cache[require.resolve(`../${category}/${cmd}.js`)];
		let newData = require(`../${category}/${cmd}.js`);
		bot.commands.set(cmd, newData);
		message.channel.send(`The command ${cmd} was reloaded.`);
	} catch(err) {
		message.channel.send("An error has occurred. This problem could be caused by: providing a nonexistent command, a bot error, or a command code error.");
	}
};

module.exports.config = {
	"aliases": [],
	"cooldown": {
		"waitTime": 0,
		"type": "global"
	},
	"guildOnly": false,
	"perms": {
		"level": 9,
		"reqEmbed": false,
		"reqPerms": null
	}
}

module.exports.help = {
	"name": "reload",
	"category": "Bot",
	"description": "Reload a command. It must be a command that has been loaded when the bot was started.",
	"usage": "reload <command>"
}
