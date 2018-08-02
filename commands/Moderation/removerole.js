const Discord = require("discord.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		let member = args[0];
		let role = args[1];
		await member.removeRole(role)
		.then(message.channel.send(`✅ Role **${role}** has been removed from **${member.user.tag}**.`))
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	},
	commandInfo: {
		aliases: ["rr", "takerole"],
		args: [
			{
				allowQuotes: true,
				num: Infinity,
				optional: false,
				type: "user"
			},
			{
				allowQuotes: false,
				num: Infinity,
				optional: false,
				type: "role"
			}
		],
		category: "Moderation",
		cooldown: {
			time: 20000,
			type: "user"
		},
		description: "Removes a role a user has. It will be logged if a modlog channel was set",
		flags: [
			{
				name: "role",
				argsType: "role"
			},
			{
				name: "user",
				argsType: "user"
			}
		],
		guildOnly: true,
		name: "removerole",
		perms: {
			bot: ["MANAGE_ROLES"],
			user: ["MANAGE_ROLES"],
			level: 2,
		},
		usage: "removerole <user> <role> `or with flags`"
	}
};

// Deprecated command info
module.exports.config = {
	aliases: ["rr", "takerole"],
	cooldown: {
		waitTime: 15000,
		type: "user"
	},
	guildOnly: true,
	perms: {
		level: 2,
		reqPerms: "MANAGE_ROLES"
	}
}

module.exports.help = {
	name: "removerole",
	category: "Moderation",
	description: "Removes a role a user has. It will be logged if a modlog channel was set",
	usage: "k,removerole <user> <role>"
}