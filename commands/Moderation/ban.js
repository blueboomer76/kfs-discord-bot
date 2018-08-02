const Discord = require("discord.js");
const resolver = require("../../utils/objResolver.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		let member = args[0];
		await member.ban()
		.then(message.channel.send(`✅ The user **${member.user.tag}** was banned from the guild.`))
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
		description: "Bans a member. It will be logged if a modlog channel was set",
		flags: [
			{
				name: "reason",
				argsType: "string"
			},
			{
				name: "days",
				argsType: "number",
				min: 1,
				max: 7
			}
		],
		guildOnly: true,
		name: "ban",
		perms: {
			bot: ["BAN_MEMBERS"],
			user: ["BAN_MEMBERS"],
			level: 2,
		},
		usage: "ban <user>"
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
		level: 3,
		reqPerms: "BAN_MEMBERS"
	}
}

module.exports.help = {
	name: "ban",
	category: "Moderation",
	description: "Bans a member. It will be logged if a modlog channel was set",
	usage: "k,ban <user>"
}