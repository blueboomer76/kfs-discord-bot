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

		let guildMembers;
		if (!message.guild.large) {
			guildMembers = message.guild.members;
		} else {
			await message.guild.fetchMembers()
			.then(g => guildMembers = g.members)
			.catch(err => {
				console.log(`Failed to fetch members: ${err}`)
				guildMembers = message.guild.members;
			})
		}

		let guildMemArray = guildMembers.array();
		guildMemArray.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
		let joinPos = guildMemArray.findIndex(mem => mem.joinedTimestamp == member.joinedTimestamp), nearbyMems = [];
		for (let i = joinPos - 2; i < joinPos + 3; i++) {
			if (i < 0 || i >= message.guild.memberCount) continue;
			nearbyMems.push(i == joinPos ? `**${guildMemArray[i].user.username}**` : guildMemArray[i].user.username);
		}
		let roleList = member.roles.map(r => r.name).join(", ");
		if (roleList.length > 1000) roleList = roleList.slice(0, 1000) + "...";

		let userEmbed = new Discord.RichEmbed()
		.setTitle(`User Info - ${member.user.tag}`)
		.setFooter(`ID: ${member.id}`)
		.setThumbnail(member.user.avatarURL ? member.user.avatarURL : `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`)
		.addField("Account created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
		.addField("Joined this server at", `${joinedDate.toUTCString()} (${getDuration(joinedDate)})`)
		.addField("Status", presence, true)
		.addField("Bot user", member.user.bot ? "Yes" : "No", true)
		.addField("Nickname", member.nickname || "None", true)
		.addField("Member #", joinPos + 1, true)
		.addField("Join order", nearbyMems.join(" > "))
		.addField(`Roles - ${member.roles.size}`, roleList)

		if (member.displayColor != 0 || (member.colorRole && member.colorRole.color == 0)) {
			userEmbed.setColor(member.displayColor);
		}
		message.channel.send(userEmbed);
	}
}

module.exports = UserInfoCommand;
