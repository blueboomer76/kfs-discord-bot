const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	if (args.length == 0) return message.channel.send("You must provide a role for info.");
	var riRole = message.mentions.roles.first() || message.guild.roles.get(args[0]);
	if (!riRole) return message.channel.send("No roles were found! A valid role mention or ID is needed.");
	let rcDate = new Date(riRole.createdTimestamp);
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Role Info for " + riRole.name)
	.setColor(riRole.color)
	.setFooter("ID: " + riRole.id)
	.addField("Role created at", rcDate.toUTCString())
	.addField("Members in Role", riRole.members.array().length)
	.addField("Color", riRole.hexColor)
	.addField("Position", (riRole.calculatedPosition + 1) + "/" + message.guild.roles.array().length)
	);
	/*
		Others found:
		Mention, Members Online, Is Hoisted, Mentionable, Managed
	*/
}

module.exports.help = {
	"name": "roleinfo"
}
