const Discord = require("discord.js");
const config = require("../../config.json");

module.exports.run = async (bot, message, args) => {
	let hCmd = args[0];
	if (!hCmd) {
		var cmds = [];
		bot.commands.forEach(cmd => cmds.push(cmd.help.name));
		message.channel.send(new Discord.RichEmbed()
		.setTitle("All bot commands")
		.setDescription(cmds.join(", "))
		.setColor(Math.floor(Math.random() * 16777216))
		);
	} else {
		var cmdProps = bot.commands.get(hCmd);
		if (!cmdProps) return message.channel.send("The command was not found.");
		let hEmbed = new Discord.RichEmbed()
		.setTitle("Help - " + hCmd)
		.setColor(Math.floor(Math.random() * 16777216))
		.addField("Category", cmdProps.help.category)
		.addField("Description", cmdProps.help.description)
		.addField("Usage", config.prefix + cmdProps.help.usage);
		if (cmdProps.config.aliases.length > 0) hEmbed.addField("Aliases", cmdProps.config.aliases.join(", "));
		message.channel.send(hEmbed);
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
		reqEmbed: true,
		reqPerms: null
	}
}

module.exports.help = {
	name: "help",
	category: "Bot",
	description: "Get help for a command, or see all commands available.",
	usage: "help [command]"
}
