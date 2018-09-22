const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const {getDuration} = require("../../modules/functions.js");

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
			cooldown: {
				time: 15000,
				type: "channel"
			},
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			},
			usage: "userinfo [user]"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0] ? args[0] : message.member;
		
		let createdDate = new Date(member.user.createdTimestamp);
		let joinedDate = new Date(member.joinedTimestamp);
		
		let rawPresence = member.presence, presence;
		if (rawPresence.status == "online") {
			presence = "Online";
		} else if (rawPresence.status == "idle") {
			presence = "Idle";
		} else if (rawPresence.status == "dnd") {
			presence = "Do Not Disturb";
		} else {
			presence = "Offline";
		}
		if (rawPresence.game) presence += ` (playing ${rawPresence.game.name})`;

		let joinTimes = message.guild.members.map(mem => mem.joinedTimestamp);
		joinTimes.sort((a, b) => a - b);
		let roleList = member.roles.map(r => r.name).join(", ");
		if (roleList.length > 1000) roleList = roleList.slice(0, 1000) + "...";

		let userEmbed = new Discord.RichEmbed()
		.setTitle(`User Info - ${member.user.tag}`)
		.setFooter(`ID: ${member.id}`)
		.setThumbnail(member.user.avatarURL)
		.addField("Account created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
		.addField("Joined this server at", `${joinedDate.toUTCString()} (${getDuration(joinedDate)})`)
		.addField("Status", presence)
		.addField("Bot user", member.user.bot ? "Yes" : "No")
		.addField("Nickname", member.nickname || "None")
		.addField("Member #", joinTimes.indexOf(member.joinedTimestamp) + 1)
		.addField(`Roles - ${member.roles.size}`, roleList)

		if (member.displayColor != 0 || (member.colorRole && member.colorRole.color == 0)) {
			userEmbed.setColor(member.displayColor);
		}
		message.channel.send(userEmbed);
	}
}

module.exports = UserInfoCommand;
