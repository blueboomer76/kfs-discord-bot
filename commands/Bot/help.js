const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	let hCmd = args[0];
	if (!hCmd) {
		message.channel.send(new Discord.RichEmbed()
		.setTitle("All the commands for this bot")
		.setColor(Math.floor(Math.random() * 16777216))
		.setDescription("Help command is under construction")
		);
	} else {
		if (!args[1]) return message.channel.send("You need to provide a category and a command in that category to get help.")
		try {
			var sHCmd = require(`../../commands/${args[0]}/${args[1]}.js`)
			if (args[1] == "help") return message.channel.send("That is this command! Please try another command to get help.");
			message.channel.send(new Discord.RichEmbed()
			.setTitle("Help for " + hCmd)
			.setColor(Math.floor(Math.random() * 16777216))
			.addField("Category", sHCmd.help.category)
			.addField("Description", sHCmd.help.description)
			.addField("Usage", sHCmd.help.usage)
			);
		} catch (err) {
			message.channel.send("You provided an invalid category or command! See k,help for all the commands.\n\n*Syntax: `k,help <category> <command>`*")
		}
	}
}

module.exports.config = {
	"aliases": null,
	"cooldown": {
		"waitTime": 15000,
		"type": "channel"
	},
	"guildOnly": false,
	"perms": {
		"level": 0,
		"reqPerms": null
	}
}

module.exports.help = {
	"name": "help",
	"category": "Util",
	"description": "Get help for a command, or see all commands available.",
	"usage": "k,help [<category> <command>]"
}