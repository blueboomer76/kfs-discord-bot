const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	var uiUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
	var argstext = args.join(" ");
	if (args == "") {
		uiUser = message.guild.member(message.author);
	} else if (!uiUser) {
		return message.channel.send("Uh-oh! That user couldn't be found!");
	}
	let cDate = new Date(uiUser.user.createdTimestamp);
	let jDate = new Date (uiUser.joinedTimestamp);
	message.channel.send(new Discord.RichEmbed()
	.setTitle("User Info for " + uiUser.user.tag)
	.setColor(uiUser.displayColor)
	.setThumbnail(uiUser.user.avatarURL)
	.setFooter("ID: " + uiUser.id)
	.addField("Account created at", cDate.toUTCString())
	.addField("Joined this server at", jDate.toUTCString() + " (Join order coming soon)")
	.addField("Is a bot", uiUser.user.bot)
	.addField("Nickname", uiUser.nickname)
	.addField("Status", uiUser.presence.status)
	.addField("Roles - " + uiUser.roles.array().length, uiUser.roles.array())
	);
	/*
		Others found:
		Seen on guild(s), Join order, Is Admin, Permissions
	*/
}

module.exports.help = {
	"name": "userinfo"
}
