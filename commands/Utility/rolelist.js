const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	var rlStart;
	if (!args[0]) {
		rlStart = 0;
	} else if (isNaN(args[0]) || args[0] < 1) {
		return message.channel.send("The page must be at least 1");
	} else {
		rlStart = Math.floor(args[0]) - 1;
	}
	var roleList = message.guild.roles.array();
	var pageRoles = roleList.slice(rlStart * 20, (rlStart + 1) * 20);
	if (pageRoles.length == 0) return message.channel.send("No roles found on this page.");
	var dispRoles = [];
	pageRoles.forEach(pRole => dispRoles.push(pRole.name));
	message.channel.send(new Discord.RichEmbed()
	.setTitle("List of roles in this server")
	.setDescription(dispRoles.join("\n"))
	.setColor(Math.floor(Math.random() * 16777216))
	.setFooter("Page " + (rlStart + 1))
	);
}

module.exports.help = {
	"name": "rolelist"
}
