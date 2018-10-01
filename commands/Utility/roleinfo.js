const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const {getDuration} = require("../../modules/functions.js");

class RoleInfoCommand extends Command {
	constructor() {
		super({
			name: "roleinfo",
			description: "Get info about a role",
			aliases: ["role"],
			args: [
				{
					num: Infinity,
					type: "role"
				}
			],
			cooldown: {
				time: 15000,
				type: "channel"
			},
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			},
			usage: "roleinfo <role>"
		});
	}
	
	async run(bot, message, args, flags) {
		let role = args[0], rolePos = role.calculatedPosition;

		let createdDate = new Date(role.createdTimestamp);
		let guildRoles = message.guild.roles, nearbyRoles = [];
		for (let i = rolePos + 2; i > rolePos - 3; i--) {
			if (i < 0 || i >= guildRoles.size) continue;
			let roleName = guildRoles.find(r => r.calculatedPosition == i).name;
			nearbyRoles.push(i == rolePos ? `**${roleName}**` : roleName);
		}

		message.channel.send(new Discord.RichEmbed()
		.setTitle(`Role Info - ${role.name}`)
		.setColor(role.color)
		.setFooter(`ID: ${role.id}`)
		.addField("Role created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
		.addField(`Members in Role [${role.members.size} total]`,
		`${role.members.filter(roleMem => roleMem.user.presence.status != "offline").size} Online`,
		true)
		.addField("Color", role.hexColor, true)
		.addField("Position from top", `${guildRoles.size - rolePos} / ${guildRoles.size}`, true)
		.addField("Displays separately (hoisted)", role.hoist ? "Yes" : "No", true)
		.addField("Mentionable", role.mentionable ? "Yes" : "No", true)
		.addField("Managed", role.managed ? "Yes" : "No", true)
		.addField("Role order", nearbyRoles.join(" > "))
		);
	}
}

module.exports = RoleInfoCommand;
