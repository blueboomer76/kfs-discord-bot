const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	if (!args[0]) return message.channel.send("You must provide a command to reload.");
	try {
		let cat = bot.commands.get(args[0]).help.category;
		let newData = require(`../../${cat}/${args[0]}.js`);
		delete require.cache[require.resolve(`../${cat}/${args[0]}.js`)];
		bot.commands.set(args[0], newData);
		message.channel.send(`The command ${args[0]} was reloaded.`);
	} catch(err) {
		message.channel.send("An error has occurred. This problem could be caused by: providing a nonexistant command, a bot error, or a command code error.");
	}
};

module.exports.config = {
	aliases: [],
	cooldown: {
		waitTime: 0,
		type: "global"
	},
	guildOnly: false,
	perms: {
		level: 9,
		reqPerms: []
	}
}

module.exports.help = {
	name: "reload",
	category: "Bot",
	description: "Reload a command. It must be a command that has been loaded when the bot was started.",
	usage: "k,reload <category> <command>"
}
