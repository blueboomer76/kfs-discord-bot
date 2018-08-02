const Discord = require("discord.js");
const resolver = require("../../utils/objResolver.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		let member = args[0];
		await member.kick()
		.then(message.channel.send(`✅ The user **${member.user.tag}** was kicked from the guild.`))
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	},
	commandInfo: {
		aliases: [],
		args: [
			{
				allowQuotes: false,
				num: Infinity,
				optional: false,
				type: "user"
			}
		],
		category: "Moderation",
		cooldown: {
			time: 25000,
			type: "user"
		},
		description: "Kicks a member. It will be logged if a modlog channel was set",
		flags: [
			{
				name: "reason",
				argsType: "string"
			},
		],
		guildOnly: true,
		name: "kick",
		perms: {
			bot: ["KICK_MEMBERS"],
			user: ["KICK_MEMBERS"],
			level: 2,
		},
		usage: "kick <user>"
	}
};

// Deprecated command info
module.exports.config = {
	aliases: [],
	cooldown: {
		waitTime: 15000,
		type: "user"
	},
	guildOnly: true,
	perms: {
		level: 2,
		reqPerms: "KICK_MEMBERS"
	}
}

module.exports.help = {
	name: "kick",
	category: "Moderation",
	description: "Kicks a member. It will be logged if a modlog channel was set",
	usage: "k,kick <user>"
}