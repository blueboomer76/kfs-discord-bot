const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const functions = require("../../modules/functions.js");

class UserInfoCommand extends Command {
	constructor() {
		super({
			name: "userinfo",
			description: "Get info about a user",
			aliases: ["user"],
			args: [
				{
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
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0,
			},
			usage: "userinfo [user]"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		if (!args[0]) member = message.guild.member(message.author);
		let createdDate = new Date(member.user.createdTimestamp);
		let joinedDate = new Date(member.joinedTimestamp);
		let userRoles = member.roles.array();
		if (userRoles.length > 1) {
			userRoles.splice(userRoles.findIndex(role => role.name == "@everyone"), 1);
			userRoles = userRoles.map(role => role.name);
		} else {
			userRoles = ["None"];
		}
		let joinTimes = message.guild.members.map(mem => mem.joinedTimestamp);
		joinTimes.sort((a, b) => a-b);
		message.channel.send(new Discord.RichEmbed()
		.setTitle("User Info - " + member.user.tag)
		.setColor(member.displayColor)
		.setThumbnail(member.user.avatarURL)
		.setFooter("ID: " + member.id)
		.addField("Account created at", `${createdDate.toUTCString()} (${functions.getDuration(createdDate)})`)
		.addField("Joined this server at", `${joinedDate.toUTCString()} (${functions.getDuration(joinedDate)})`)
		.addField("Bot user", member.user.bot ? "Yes" : "No")
		.addField("Nickname", member.nickname ? member.nickname : "None")
		.addField("Status", member.presence.status)
		.addField("Member #", joinTimes.indexOf(member.joinedTimestamp) + 1)
		.addField("Roles - " + (userRoles.length - 1), userRoles.join(", "))
		);
	}
}

module.exports = UserInfoCommand;