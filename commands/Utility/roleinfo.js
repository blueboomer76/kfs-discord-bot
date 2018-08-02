const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		let role = args[0];
		let createdDate = new Date(role.createdTimestamp);
		let onlineRoleMembers = 0;
		role.members.forEach(mem => {
			if (mem.presence.status == "online") onlineRoleMembers++;
		})
		let rPos = role.calculatedPosition + 1;

		message.channel.send(new Discord.RichEmbed()
		.setTitle("Role Info - " + role.name)
		.setColor(role.color)
		.setFooter("ID: " + role.id)
		.addField("Role created at", `${createdDate.toUTCString()} (${fList.getDuration(createdDate)})`)
		.addField("Members in Role [" + role.members.array().length + " total]", onlineRoleMembers + " Online", true)
		.addField("Color", role.hexColor)
		.addField("Position from bottom", rPos + "/" + message.guild.roles.array().length)
		.addField("Displays separately (hoisted)", role.hoist)
		.addField("Mentionable", role.mentionable)
		.addField("Managed", role.managed)
		);
	},
	commandInfo: {
		aliases: ["role"],
		args: [
			{
				allowQuotes: false,
				num: Infinity,
				optional: false,
				type: "role"
			}
		],
		category: "Utility",
		cooldown: {
			time: 15000,
			type: "channel"
		},
		description: "Get info about a role",
		flags: null,
		guildOnly: true,
		name: "roleinfo",
		perms: {
			bot: ["EMBED_LINKS"],
			user: null,
			level: 0
		},
		usage: "roleinfo <role>"
	}
}
