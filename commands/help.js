const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	var cmds = [];
	bot.commands.forEach(cmd => cmds.push(cmd.help.name));
	message.channel.send(new Discord.RichEmbed()
	.setTitle("All bot commands")
	.setDescription(cmds.join(", "))
	.setColor(Math.floor(Math.random() * 16777216))
	);
}

module.exports.help = {
	"name": "help"
}
