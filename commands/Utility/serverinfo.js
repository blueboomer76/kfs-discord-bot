const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const {getDuration} = require("../../modules/functions.js");

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
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			}
		});
	}
	
	async run(bot, message, args, flags) {
		let guild = message.guild, guildMembers;
		if (!guild.large) {
			guildMembers = guild.members;
		} else {
			await guild.fetchMembers()
			.then(g => {guildMembers = g.members})
			.catch(err => {
				console.error(`Failed to fetch members: ${err}`)
				guildMembers = guild.members;
			})
		}

		let createdDate = new Date(guild.createdTimestamp),
			guildVerif;
		switch (guild.verificationLevel) {
			case 0:
				guildVerif = "None";
				break;
			case 1:
				guildVerif = "Low (verified email)";
				break;
			case 2:
				guildVerif = "Medium (registered for 5 mins)";
				break;
			case 3:
				guildVerif = "High (member for 10 mins)";
				break;
			case 4:
				guildVerif = "Very High (verified phone)";
		}
		let onlineCount = guild.presences.filter(p => p.status != "offline").size,
			botCount = guildMembers.filter(mem => mem.user.bot).size;

		message.channel.send(new Discord.RichEmbed()
		.setTitle(`Server Info - ${guild.name}`)
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter(`ID: ${guild.id} | Server data as of`)
		.setThumbnail(guild.iconURL)
		.setTimestamp(message.createdAt)
		.addField("Created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
		.addField("Owner", `${guild.owner.user.tag} \`(ID ${guild.owner.id})\``)
		.addField("Region", guild.region, true)
		.addField("Verification", guildVerif, true)
		.addField("Explicit Filter", guild.explicitContentFilter == 0 ? "None" : (guild.explicitContentFilter == 1 ? "Low" : "High"), true)
		.addField(`Members [${guild.memberCount} total]`,
		`${onlineCount} Online (${(onlineCount / guild.memberCount * 100).toFixed(1)}%)\n` +
		`${botCount} Bots (${(botCount / guild.memberCount * 100).toFixed(1)}%)`,
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
