const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	let gcDate = new Date(message.guild.createdTimestamp);
	var botCount = 0;
	var onlineCount = 0;
	var tcCount = 0;
	var vcCount = 0;
	var ccCount = 0;
	message.guild.members.forEach(member => {
		if (member.user.bot) botCount++;
		if (member.presence.status == "online") onlineCount++;
	});
	message.guild.channels.forEach(chnl => {
		if (chnl.type == "text") {
			tcCount++;
		} else if (chnl.type == "voice") {
			vcCount++;
		} else if (chnl.type == "category") {
			ccCount++;
		}
	});
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Server Info - " + message.guild.name)
	.setColor(Math.floor(Math.random() * 16777216))
	.setFooter("ID: " + message.guild.id + " | Server data as of")
	.setThumbnail(message.guild.iconURL)
	.setTimestamp(message.createdAt)
	.addField("Created at", gcDate.toUTCString() + " (" + fList.getDuration(gcDate) + ")")
	.addField("Owner", message.guild.owner.user.tag + " (ID " + message.guild.owner.id + ")")
	.addField("Region", message.guild.region)
	.addField("Verification Level", message.guild.verificationLevel)
	.addField("Explicit Filter Level", message.guild.explicitContentFilter)
	.addField("Members [" + message.guild.memberCount + " total]", onlineCount + " Online" + "\n" + botCount + " Bots", true)
	.addField("Roles [" + message.guild.roles.array().length + " total]", "Use `rolelist` to see all roles", true)
	.addField("Channels [" + message.guild.channels.array().length + " total]", tcCount + " Text" + "\n" + vcCount + " Voice" + "\n" + ccCount + " Categories", true)
	);
}

module.exports.config = {
	aliases: ["guild", "guildinfo", "server"],
	cooldown: {
		waitTime: 120000,
		type: "guild"
	},
	guildOnly: true,
	perms: {
		level: 0,
		reqEmbed: true,
		reqPerms: null
	}
}

module.exports.help = {
	name: "serverinfo",
	category: "Utility",
	description: "Get info about this server",
	usage: "serverinfo"
}
