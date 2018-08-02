const Discord = require("discord.js");
const paginator = require("../../utils/paginator.js")

module.exports = {
	run: async (bot, message, args, flags) => {
		let startPage;
		if (!args[0]) {startPage = 1;} else {startPage = args[0];}
		let roles = message.guild.roles.array();
		let entries = [];
		for (let i = 0; i < roles.length; i++) {
			entries.push(roles[i].name);
		}
		let roleListEmbed = paginator.generateEmbed(startPage, entries, null, 20, null)
		message.channel.send(roleListEmbed
		.setTitle("List of roles - " + message.guild.name)
		)
		.then(newMessage => {
			if (roleList.length > 20) {
				paginator.addPgCollector(message, newMessage, entries, null, 20, null)
			}
		})
	},
	commandInfo: {
		aliases: ["roles"],
		args: [
			{
				allowQuotes: false,
				num: 1,
				optional: true,
				type: "number",
				min: 1
			}
		],
		category: "Utility",
		cooldown: {
			time: 30000,
			type: "guild"
		},
		description: "Get the guild's roles",
		flags: null,
		guildOnly: true,
		name: "rolelist",
		perms: {
			bot: null,
			user: null,
			level: 0,
		},
		usage: "rolelist [page]"
	}
}

// Deprecated command info
module.exports.config = {
	aliases: ["roles"],
	cooldown: {
		waitTime: 30000,
		type: "guild"
	},
	guildOnly: true,
	perms: {
		level: 0,
		reqPerms: null
	}
}

module.exports.help = {
	name: "rolelist",
	category: "Utility",
	description: "Get the guild's roles",
	usage: "k,rolelist [page]"
}
