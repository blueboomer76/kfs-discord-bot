const paginator = require("../../utils/paginator.js")

module.exports = {
	run: async (bot, message, args, flags) => {
		let startPage;
		if (!args[0]) {startPage = 1} else {startPage = args[0]}
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
			if (roles.length > 20) {
				paginator.addPgCollector(message, newMessage, entries, null, 20)
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
		description: "Get the server's roles",
		flags: null,
		guildOnly: true,
		name: "rolelist",
		perms: {
			bot: ["ADD_REACTIONS", "EMBED_LINKS", "MANAGE_MESSAGES"],
			user: null,
			level: 0
		},
		usage: "rolelist [page]"
	}
}
