const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	var riRole = message.mentions.roles.first() || message.guild.roles.get(args[0]);
	var argstext = args.join(" ");
	if (args == "") {
		return message.channel.send("You must provide a role for info.");
	} else if (!riRole) {
		return message.channel.send("Uh-oh! That role couldn't be found!");
	}
	let cDate = new Date(riRole.createdTimestamp);
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Role Info for " + riRole.name)
	.setColor(riRole.color)
	.setFooter("ID: " + riRole.id)
	.addField("Role created at", cDate.toUTCString())
	.addField("Color", riRole.hexColor)
	.addField("Members in Role", riRole.members.array().length)
	.addField("Position", riRole.position + "/" + message.guild.roles.array().length)
	);
	/*
		Others found:
		Mention, Members Online, Is Hoisted, Mentionable, Managed
	*/
}

module.exports.help = {
	"name": "roleinfo",
	"category": "Utility",
	"description": "Get info about a role",
	"usage": "k,role [roleName]"
}
