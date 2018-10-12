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
		let member = args[0] ? args[0] : message.member, guildMembers, userRoles = member.roles.array();
		
		userRoles.splice(userRoles.findIndex(role => role.name == "@everyone"), 1);
		userRoles = userRoles.map(role => role.name);
		
		if (!message.guild.large) {
			guildMembers = message.guild.members;
		} else {
			await message.guild.fetchMembers()
			.then(g => {
				guildMembers = g.members;
			})
			.catch(err => {
				console.log(`Failed to fetch members: ${err}`)
				guildMembers = message.guild.members;
			})
		}
		
		let guildMemArray = guildMembers.array();
		guildMemArray.sort((a,b) => a.joinedTimestamp - b.joinedTimestamp);
		
		let joinPos = guildMemArray.findIndex(mem => mem.joinedTimestamp == member.joinedTimestamp), nearbyMems = [];
		for (let i = joinPos - 2; i < joinPos + 3; i++) {
			if (i < 0 || i >= message.guild.memberCount) continue;
			nearbyMems.push(i == joinPos ? `**${guildMemArray[i].user.username}**` : guildMemArray[i].user.username);
		}
		
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
		if (memPresence.game) userPresence += ` (playing ${memPresence.game.name})`
		
		let createdDate = new Date(member.user.createdTimestamp);
		let joinedDate = new Date(member.joinedTimestamp);
		
		let userEmbed = new Discord.RichEmbed()
		.setTitle(`User Info - ${member.user.tag}`)
		.setThumbnail(member.user.avatarURL ? member.user.avatarURL : `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`)
		.setFooter(`ID: ${member.id}`)
		.addField("Account created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
		.addField("Joined this server at", `${joinedDate.toUTCString()} (${getDuration(joinedDate)})`)
		.addField("Status", userPresence, true)
		.addField("Nickname", member.nickname ? member.nickname : "None", true)
		.addField("Bot user", member.user.bot ? "Yes" : "No", true)
		.addField("Member #", joinPos + 1, true)
		.addField("Join order", `${nearbyMems.join(" > ")}`)
		.addField(`Roles - ${userRoles.length}`, userRoles.length == 0 ? "None" : userRoles.join(", "));
		
		if (member.displayColor != 0 || (member.colorRole && member.colorRole.color == 0)) {
			userEmbed.setColor(member.displayColor);
		}
		message.channel.send(userEmbed);
	}
}

module.exports = UserInfoCommand;