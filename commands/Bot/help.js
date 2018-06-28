const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	let hCmd = args[0];
	if (!hCmd) {
		let commandList = Array.from(bot.commands.keys()).join(", ")
		message.channel.send(new Discord.RichEmbed()
		.setTitle("All the commands for this bot")
		.setColor(Math.floor(Math.random() * 16777216))
		.setDescription(commandList)
		);
	} else {
		let sHCmd = bot.commands.get(args[0]);
		if (!sHCmd) return message.channel.send("You provided an invalid command! See `k,help` for all the commands.\n\n*Syntax: `k,help <command>`*")
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Help - " + hCmd)
		.setColor(Math.floor(Math.random() * 16777216))
		.addField("Category", sHCmd.help.category)
		.addField("Description", sHCmd.help.description)
		.addField("Usage", sHCmd.help.usage)
		.addField("Aliases", sHCmd.config.aliases.join(", "))
		);
	}
}

module.exports.config = {
	aliases: [],
	cooldown: {
		waitTime: 15000,
		type: "channel"
	},
	guildOnly: false,
	perms: {
		level: 0,
		reqPerms: []
	}
}

module.exports.help = {
	name: "help",
	category: "Bot",
	description: "Get help for a command, or see all commands available.",
	usage: "k,help [command]"
}