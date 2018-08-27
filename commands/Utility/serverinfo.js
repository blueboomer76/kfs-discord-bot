const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const functions = require("../../modules/functions.js");

class ServerInfoCommand extends Command {
	constructor() {
		super({
			name: "serverinfo",
			description: "Get info about this server",
			aliases: ["guild", "guildinfo", "server"],
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
		message.channel.send(new Discord.RichEmbed()
		.setTitle(`Server Info - ${guild.name}`)
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter(`ID: ${guild.id} | Server data as of`)
		.setThumbnail(guild.iconURL)
		.setTimestamp(message.createdAt)
		.addField("Created at", `${createdDate.toUTCString()} (${functions.getDuration(createdDate)})`)
		.addField("Owner", `${guild.owner.user.tag} \`(ID ${guild.owner.id})\``)
		.addField("Region", guild.region)
		.addField("Verification Level", guild.verificationLevel)
		.addField("Explicit Filter Level", guild.explicitContentFilter)
		.addField(`Members [${guild.memberCount} total]`,
		`${guild.presences.filter(p => p.status != "offline").size} Online\n` +
		`${guild.members.filter(mem => mem.user.bot).size} Bots`,
		true)
		.addField(`Roles [${guild.roles.size} total]`, "Use `rolelist` to see all roles", true)
		.addField(`Channels [${guild.channels.size} total]`,
		`${guild.channels.filter(chnl => chnl.type == "text").size} Text\n` +
		`${guild.channels.filter(chnl => chnl.type == "voice").size} Voice\n` +
		`${guild.channels.filter(chnl => chnl.type == "category").size} Categories`,
		true)
		);
	}
}

module.exports = ServerInfoCommand;
