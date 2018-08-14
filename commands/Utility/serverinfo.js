const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const functions = require("../../modules/functions.js");

class ServerInfoCommand extends Command {
	constructor() {
		super({
			name: "serverinfo",
			description: "Get info about a role",
			aliases: ["guild", "guildinfo", "server"],
			category: "Utility",
			cooldown: {
				time: 120000,
				type: "guild"
			},
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0,
			}
		});
	}
	
	async run(bot, message, args, flags) {
		let guild = message.guild;
		let checkDate = new Date();
		let createdDate = new Date(guild.createdTimestamp);
		let botCount = 0;
		for (const mem of guild.members.array()) {if (mem.user.bot) botCount++;}
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Server Info - " + guild.name)
		.setColor(Math.floor(Math.random() * 16777216))
		.setThumbnail(guild.iconURL)
		.setFooter("ID: " + guild.id + " | Server data as of")
		.setTimestamp(message.createdAt)
		.addField("Created at", `${createdDate.toUTCString()} (${functions.getDuration(createdDate)})`)
		.addField("Owner", guild.owner.user.tag + " `(ID " + guild.ownerID + ")`")
		.addField("Region", guild.region)
		.addField("Verification Level", guild.verificationLevel)
		.addField("Explicit Filter Level", guild.explicitContentFilter)
		.addField("Members [" + guild.memberCount + " total]",
		guild.presences.findAll(`status`, "online").length + " Online" + "\n" + botCount + " Bots", true)
		.addField("Roles [" + guild.roles.size + " total]", "`k,rolelist` to see all roles", true)
		.addField("Channels [" + guild.channels.size + " total]",
		message.guild.channels.findAll(`type`, "text").length + " Text" + "\n" +
		message.guild.channels.findAll(`type`, "voice").length + " Voice" + "\n" +
		message.guild.channels.findAll(`type`, "category").length + " Categories",
		true)
		);
	// }
}

module.exports = ServerInfoCommand;