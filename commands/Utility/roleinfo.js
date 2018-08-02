const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		let role = args[0];
		let createdDate = new Date(riRole.createdTimestamp);
		let roleMembers = 0;
		role.members.forEach(mem => {
			if (mem.presence.status == "online") roleMembers++;
		})
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Role Info - " + role.name)
		.setColor(role.color)
		.setFooter("ID: " + role.id)
		.addField("Role created at", `${createdDate.toUTCString()} (${fList.getDuration(createdDate)})`)
		.addField("Color", role.hexColor)
		.addField("Members in Role [" + Array.from(role.members).length + " total]",
		roleMembers + " Online",
		true)
		.addField("Position from top", role.position + "/" + Array.from(role.members).length)
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
			bot: null,
			user: null,
			level: 0,
		},
		usage: "roleinfo <role>"
	}
}

module.exports.config = {
	aliases: ["role"],
	cooldown: {
		waitTime: 15000,
		type: "channel"
	},
	guildOnly: true,
	perms: {
		level: 0,
		reqPerms: null
	}
}

module.exports.help = {
	name: "roleinfo",
	category: "Utility",
	description: "Get info about a role",
	usage: "k,roleinfo <role>"
}
