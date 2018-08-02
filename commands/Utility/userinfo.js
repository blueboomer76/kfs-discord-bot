const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		let member = args[0];
		if (!args[0]) member = message.guild.member(message.author);

		let createdDate = new Date(member.user.createdTimestamp);
		let joinedDate = new Date(member.joinedTimestamp);
		let nick = member.nickname || "None";
		let joinTimes = [];
		message.guild.members.forEach(mem => joinTimes.push(mem.joinedTimestamp))
		joinTimes.sort((a, b) => a - b);

		message.channel.send(new Discord.RichEmbed()
		.setTitle("User Info - " + member.user.tag)
		.setColor(member.displayColor)
		.setFooter("ID: " + member.id)
		.setThumbnail(member.user.avatarURL)
		.addField("Account created at", `${createdDate.toUTCString()} (${fList.getDuration(createdDate)})`)
		.addField("Joined this server at", `${joinedDate.toUTCString()} (${fList.getDuration(joinedDate)})`)
		.addField("Status", member.presence.status)
		.addField("Bot user", member.user.bot)
		.addField("Nickname", nick)
		.addField("Member #", joinTimes.indexOf(member.joinedTimestamp) + 1)
		.addField("Roles - " + member.roles.array().length, member.roles.array().join(", "))
		);

		/*
			Others found:
			Seen on guild(s), Is Admin, Permissions
		*/
	},
	commandInfo: {
		aliases: ["user"],
		args: [
			{
				allowQuotes: false,
				num: Infinity,
				optional: true,
				type: "member"
			}
		],
		category: "Utility",
		cooldown: {
			time: 15000,
			type: "channel"
		},
		description: "Get info about a user",
		flags: null,
		guildOnly: true,
		name: "userinfo",
		perms: {
			bot: ["EMBED_LINKS"],
			user: null,
			level: 0
		},
		usage: "userinfo [user]"
	}
}
