const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		let member = args[0];
		if (!args[0]) user = message.guild.member(message.author);
		let nick = user.nickname || "None";
		let createdDate = new Date(member.user.createdTimestamp);
		let joinedDate = new Date(member.joinedTimestamp);
		let userRoles = member.roles.array();
		userRoles.splice(userRoles.findIndex(role => role.name == "@everyone"), 1);
		let joinTimes = [];
		message.guild.members.forEach(mem => {
			joinTimes.push(mem.joinedTimestamp);
		})
		joinTimes.sort(function(a, b){return a-b});
		message.channel.send(new Discord.RichEmbed()
		.setTitle("User Info - " + member.user.tag)
		.setColor(member.displayColor)
		.setThumbnail(member.user.avatarURL)
		.setFooter("ID: " + member.id)
		.addField("Account created at", `${createdDate.toUTCString()} (${fList.getDuration(createdDate)})`)
		.addField("Joined this server at", `${joinedDate.toUTCString()} (${fList.getDuration(joinedDate)})`)
		.addField("Bot user", member.user.bot)
		.addField("Nickname", nick)
		.addField("Status", member.presence.status)
		.addField("Member #", joinTimes.indexOf(member.joinedTimestamp) + 1)
		.addField("Roles - " + userRoles.length, userRoles.join(", "))
		);
		/*
			Others found:
			Seen on guild(s), Is Admin, Permissions
		*/
	},
	commandInfo: {
		aliases: ["user"],
		args: {
			allowQuotes: false,
			num: Infinity,
			optional: true,
			type: "user"
		},
		category: "Utility",
		cooldown: {
			time: 15000,
			type: "channel"
		},
		description: "Get info about you, or another user",
		flags: null,
		guildOnly: true,
		name: "userinfo",
		perms: {
			bot: null,
			user: null,
			level: 0,
		},
		usage: "userinfo [user]"
	}
}

// Deprecated command info
module.exports.config = {
	aliases: ["user"],
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
	name: "userinfo",
	category: "Utility",
	description: "Get info about you, or another user",
	usage: "k,userinfo [user]"
}
