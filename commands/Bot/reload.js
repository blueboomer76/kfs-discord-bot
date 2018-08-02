const Discord = require("discord.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		try {
			let commandName = args[0].commandInfo.name;
			let cat = args[0].commandInfo.category;
			delete require.cache[require.resolve(`../${cat}/${commandName}.js`)];
			let newData = require(`../${cat}/${commandName}.js`);
			bot.commands.set(commandName, newData);
			message.channel.send(`The command ${commandName} was reloaded.`);
		} catch(err) {
			message.channel.send("There is an error in the code for the command you provided." + "\n" + ":```javascript" + err + "```");
		}
	},
	commandInfo: {
		aliases: [],
		args: [
			{
				allowQuotes: false,
				num: 1,
				optional: false,
				type: "command"
			}
		],
		category: "Bot",
		cooldown: {
			time: 0,
			type: "global"
		},
		description: "Reload a command. It must be a command that is already loaded",
		flags: null,
		guildOnly: false,
		name: "reload",
		perms: {
			bot: null,
			user: null,
			level: 7,
		},
		usage: "reload <command>"
	}
};