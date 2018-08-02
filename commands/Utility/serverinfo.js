const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		let guild = message.guild;
		let createdDate = new Date(guild.createdTimestamp);
		let botCount = 0;
		let onlineCount = 0;
		let tcCount = 0;
		let vcCount = 0;
		let ccCount = 0;
		guild.members.forEach(member => {
			if (member.user.bot) botCount++;
			if (member.presence.status == "online") onlineCount++;
		});
		guild.channels.forEach(chnl => {
			if (chnl.type == "text") {
				tcCount++;
			} else if (chnl.type == "voice") {
				vcCount++;
			} else if (chnl.type == "category") {
				ccCount++;
			}
		});
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Server Info - " + guild.name)
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter("ID: " + guild.id + " | Server data as of")
		.setThumbnail(guild.iconURL)
		.setTimestamp(message.createdAt)
		.addField("Created at", `${createdDate.toUTCString()} (${fList.getDuration(createdDate)})`)
		.addField("Owner", guild.owner.user.tag + " (ID " + guild.owner.id + ")")
		.addField("Region", guild.region)
		.addField("Verification Level", guild.verificationLevel)
		.addField("Explicit Filter Level", guild.explicitContentFilter)
		.addField("Members [" + guild.memberCount + " total]", onlineCount + " Online" + "\n" + botCount + " Bots", true)
		.addField("Roles [" + guild.roles.array().length + " total]", "Use `rolelist` to see all roles", true)
		.addField("Channels [" + guild.channels.array().length + " total]", tcCount + " Text" + "\n" + vcCount + " Voice" + "\n" + ccCount + " Categories", true)
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
			level: 0
		},
		usage: "serverinfo"
	}
}
