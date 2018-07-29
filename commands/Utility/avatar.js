const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
	var member;
	if (args.length == 0) {
		member = message.guild.member(message.author);
	} else {
		var argstext = args.join(" ");
		member = fList.findMember(message, argstext);
		if (!member) return message.channel.send("The user provided could not be found in this guild.");
	}
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Avatar - " + member.user.tag)
	.setColor(Math.floor(Math.random() * 16777216))
	.setImage(member.user.avatarURL)
	);
}

module.exports.config = {
	aliases: ["profilepic", "pfp"],
	cooldown: {
		waitTime: 15000,
		type: "channel"
	},
	guildOnly: true,
	perms: {
		level: 0,
		reqEmbed: true,
		reqPerms: null
	}
}

module.exports.help = {
	name: "avatar",
	category: "Utility",
	description: "Get a user's avatar",
	usage: "avatar [user]"
}
