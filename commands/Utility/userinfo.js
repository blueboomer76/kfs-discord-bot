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
		
		let userRoles = member.roles.array();
		userRoles.splice(userRoles.findIndex(role => role.name == "@everyone"), 1);
		userRoles = userRoles.map(role => role.name);
		
		let joinTimes = message.guild.members.map(mem => mem.joinedTimestamp);
		joinTimes.sort((a,b) => a-b);
		
		let memPresence = member.presence, userPresence;
		if (memPresence.status == "online") {
			userPresence = "Online";
		} else if (memPresence.status == "idle") {
			userPresence = "Idle";
		} else if (memPresence.status == "dnd") {
			userPresence = "Do Not Disturb";
		} else {
			userPresence = "Offline";
		}
		if (memPresence.game) {
			userPresence += ` (playing ${memPresence.game.name})`
		}
		
		let userEmbed = new Discord.RichEmbed()
		.setTitle(`User Info - ${member.user.tag}`)
		.setThumbnail(member.user.avatarURL)
		.setFooter(`ID: ${member.id}`)
		.addField("Account created at", `${createdDate.toUTCString()} (${functions.getDuration(createdDate)})`)
		.addField("Joined this server at", `${joinedDate.toUTCString()} (${functions.getDuration(joinedDate)})`)
		.addField("Status", userPresence)
		.addField("Nickname", member.nickname ? member.nickname : "None")
		.addField("Bot user", member.user.bot ? "Yes" : "No")
		.addField("Member #", joinTimes.indexOf(member.joinedTimestamp) + 1)
		.addField(`Roles - ${userRoles.length}`, userRoles.length == 0 ? "None" : userRoles.join(", "));
		
		if (member.displayColor != 0 || (member.colorRole && member.colorRole.color == 0)) {
			userEmbed.setColor(member.displayColor);
		}
		message.channel.send(userEmbed);
	}
}

module.exports = UserInfoCommand;