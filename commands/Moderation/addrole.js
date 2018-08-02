const Discord = require("discord.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		let member = args[0];
		let role = args[1];
		await member.addRole(role)
		.then(message.channel.send(`✅ Role **${role}** has been added to **${member.user.tag}**.`))
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	},
	commandInfo: {
		aliases: ["ar", "giverole", "setrole"],
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
		description: "Adds a role to a user. It will be logged if a modlog channel was set",
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
		name: "addrole",
		perms: {
			bot: ["MANAGE_ROLES"],
			user: ["MANAGE_ROLES"],
			level: 2,
		},
		usage: "addrole <user> <role> `or with flags`"
	}
};

// Deprecated command info
module.exports.config = {
	aliases: ["ar", "giverole", "setrole"],
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
	name: "addrole",
	category: "Moderation",
	description: "Adds a role to a user. It will be logged if a modlog channel was set",
	usage: "k,addrole <user> <role>"
}