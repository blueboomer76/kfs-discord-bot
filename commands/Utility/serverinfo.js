const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		let guild = message.guild;
		let checkDate = new Date();
		let createdDate = new Date(guild.createdTimestamp);
		let botCount = 0;
		guild.members.forEach(mem => {if (mem.user.bot) {botCount++;}});
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Server Info - " + guild.name)
		.setColor(Math.floor(Math.random() * 16777216))
		.setThumbnail(guild.iconURL)
		.setFooter("ID: " + guild.id + " | Server data as of")
		.setTimestamp(message.createdAt)
		.addField("Created at", `${createdDate.toUTCString()} (${fList.getDuration(createdDate)})`)
		.addField("Owner", guild.owner.user.tag + " (ID " + guild.ownerID + ")")
		.addField("Region", guild.region)
		.addField("Verification Level", guild.verificationLevel)
		.addField("Explicit Filter Level", guild.explicitContentFilter)
		.addField("Members [" + guild.memberCount + " total]",
		guild.presences.findAll(`status`, "online").length + " Online" + "\n" + botCount + " Bots", true)
		.addField("Roles [" + Array.from(guild.roles).length + " total]", "`k,rolelist` to see all roles", true)
		.addField("Channels [" + guild.channels.array().length + " total]",
		message.guild.channels.findAll(`type`, "text").length + " Text" + "\n" +
		message.guild.channels.findAll(`type`, "voice").length + " Voice" + "\n" +
		message.guild.channels.findAll(`type`, "category").length + " Categories",
		true)
		);
	},
	commandInfo: {
		aliases: ["guild", "guildinfo", "server"],
		args: null,
		category: "Utility",
		cooldown: {
			time: 120000,
			type: "guild"
		},
		description: "Get info about this server",
		flags: null,
		guildOnly: true,
		name: "serverinfo",
		perms: {
			bot: ["EMBED_LINKS"],
			user: null,
			level: 0,
		},
		usage: "serverinfo"
	}
}