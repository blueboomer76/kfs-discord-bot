const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const functions = require("../../modules/functions.js");

class ServerInfoCommand extends Command {
	constructor() {
		super({
			name: "serverinfo",
			description: "Get info about this server",
			aliases: ["guild", "guildinfo", "server"],
			category: "Utility",
			cooldown: {
				time: 120000,
				type: "guild"
			},
			guildOnly: true,
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			}
		});
	}
	
	async run(bot, message, args, flags) {
		let guild = message.guild;
		let createdDate = new Date(guild.createdTimestamp);
		let botCount = 0;
		let onlineCount = 0;
		let tcCount = 0;
		let vcCount = 0;
		let ccCount = 0;
		for (let member of guild.members.array()) {
			if (member.user.bot) botCount++;
			if (member.presence.status == "online") onlineCount++;
		}
		for (let chnl of guild.channels.array()) {
			if (chnl.type == "text") {
				tcCount++;
			} else if (chnl.type == "voice") {
				vcCount++;
			} else if (chnl.type == "category") {
				ccCount++;
			}
		}
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Server Info - " + guild.name)
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter("ID: " + guild.id + " | Server data as of")
		.setThumbnail(guild.iconURL)
		.setTimestamp(message.createdAt)
		.addField("Created at", `${createdDate.toUTCString()} (${functions.getDuration(createdDate)})`)
		.addField("Owner", guild.owner.user.tag + " `(ID " + guild.owner.id + ")`")
		.addField("Region", guild.region)
		.addField("Verification Level", guild.verificationLevel)
		.addField("Explicit Filter Level", guild.explicitContentFilter)
		.addField("Members [" + guild.memberCount + " total]", onlineCount + " Online" + "\n" + botCount + " Bots", true)
		.addField("Roles [" + guild.roles.size + " total]", "Use `rolelist` to see all roles", true)
		.addField("Channels [" + guild.channels.size + " total]", tcCount + " Text" + "\n" + vcCount + " Voice" + "\n" + ccCount + " Categories", true)
		);
	}
}

module.exports = ServerInfoCommand;
