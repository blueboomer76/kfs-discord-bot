const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const functions = require("../../modules/functions.js");

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
			category: "Utility",
			cooldown: {
				time: 15000,
				type: "channel"
			},
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0,
			},
			usage: "roleinfo <role>"
		});
	}
	
	async run(bot, message, args, flags) {
		let role = args[0];
		let createdDate = new Date(role.createdTimestamp);
		let roleMembers = 0;
		for (let mem of role.members.array()) {
			if (mem.user.presence.status == "online") roleMembers++;
		}
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Role Info - " + role.name)
		.setColor(role.color)
		.setFooter("ID: " + role.id)
		.addField("Role created at", `${createdDate.toUTCString()} (${functions.getDuration(createdDate)})`)
		.addField("Color", role.hexColor)
		.addField("Members in Role [" + role.members.size + " total]",
		roleMembers + " Online",
		true)
		.addField("Position from bottom", role.position + "/" + message.guild.roles.size)
		.addField("Displays separately (hoisted)", role.hoist)
		.addField("Mentionable", role.mentionable)
		.addField("Managed", role.managed)
		);
	}
}

module.exports = RoleInfoCommand;