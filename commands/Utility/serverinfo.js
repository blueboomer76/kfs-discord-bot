const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const {getDuration} = require("../../modules/functions.js");

class ServerInfoCommand extends Command {
	constructor() {
		super({
			name: "serverinfo",
			description: "Get info about a role",
			aliases: ["guild", "guildinfo", "server"],
			cooldown: {
				time: 120000,
				type: "guild"
			},
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			}
		});
	}
	
	async run(bot, message, args, flags) {
		let guild = message.guild;
		let checkDate = new Date();
		let createdDate = new Date(guild.createdTimestamp);
		message.channel.send(new Discord.RichEmbed()
		.setTitle(`Server Info - ${guild.name}`)
		.setColor(Math.floor(Math.random() * 16777216))
		.setThumbnail(guild.iconURL)
		.setFooter(`ID: ${guild.id} | Server data as of`)
		.setTimestamp(message.createdAt)
		.addField("Created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
		.addField("Owner", `${guild.owner.user.tag} \`(ID ${guild.ownerID})\``)
		.addField("Region", guild.region)
		.addField("Verification Level", guild.verificationLevel)
		.addField("Explicit Filter Level", guild.explicitContentFilter)
		.addField(`Members [${guild.memberCount} total]`,
		`${guild.presences.size} Online\n${guild.members.filter(mem => mem.user.bot).size} Bots`,
		true)
		.addField(`Roles [${guild.roles.size} total]`, "`k,rolelist` to see all roles", true)
		.addField(`Channels [${guild.channels.size} total]`,
		`${message.guild.channels.filter(chnl => chnl.type == "text").size} Text\n` +
		`${message.guild.channels.filter(chnl => chnl.type == "voice").size} Voice\n` +
		`${message.guild.channels.filter(chnl => chnl.type == "category").size} Categories`,
		true)
		);
	}
}

module.exports = ServerInfoCommand;