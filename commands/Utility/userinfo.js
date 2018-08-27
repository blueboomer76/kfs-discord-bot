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
			guildOnly: true,
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			},
			usage: "userinfo [user]"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		if (!args[0]) member = message.member;

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

		message.channel.send(new Discord.RichEmbed()
		.setTitle(`User Info - ${member.user.tag}`)
		.setColor(member.displayColor)
		.setFooter(`ID: ${member.id}`)
		.setThumbnail(member.user.avatarURL)
		.addField("Account created at", `${createdDate.toUTCString()} (${functions.getDuration(createdDate)})`)
		.addField("Joined this server at", `${joinedDate.toUTCString()} (${functions.getDuration(joinedDate)})`)
		.addField("Status", presence)
		.addField("Bot user", member.user.bot ? "Yes" : "No")
		.addField("Nickname", member.nickname || "None")
		.addField("Member #", joinTimes.indexOf(member.joinedTimestamp) + 1)
		.addField(`Roles - ${member.roles.size}`, member.roles.array().join(", "))
		);
	}
}

module.exports = UserInfoCommand;
