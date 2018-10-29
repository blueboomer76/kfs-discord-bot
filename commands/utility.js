const Discord = require("discord.js");
const Command = require("../structures/command.js");
const {capitalize, getDuration} = require("../modules/functions.js");
const paginator = require("../utils/paginator.js");

module.exports = [
	class AvatarCommand extends Command {
		constructor() {
			super({
				name: "avatar",
				description: "Get a user's avatar",
				aliases: ["profilepic", "pfp"],
				args: [
					{
						infiniteArgs: true,
						optional: true,
						type: "member"
					}
				],
				cooldown: {
					time: 15000,
					type: "channel"
				},
				usage: "avatar [user]"
			});
		}
		
		async run(bot, message, args, flags) {
			let member = args[0];
			let avatarURL = member.user.avatarURL ? member.user.avatarURL : `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`
			if (!member) member = message.member;
			message.channel.send(new Discord.RichEmbed()
			.setTitle(`Avatar - ${member.user.tag}`)
			.setDescription(`Avatar URL: ${avatarURL}`)
			.setColor(Math.floor(Math.random() * 16777216))
			.setImage(avatarURL)
			);
		}
	},
	class ChannelInfoCommand extends Command {
		constructor() {
			super({
				name: "channelinfo",
				description: "Get info about a channel",
				aliases: ["channel"],
				args: [
					{
						infiniteArgs: true,
						optional: true,
						type: "channel"
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
				usage: "channelinfo [channel]"
			});
		}
		
		async run(bot, message, args, flags) {
			let channel = args[0] ? args[0] : message.channel;
			let createdDate = new Date(channel.createdTimestamp);
			let channelEmbed = new Discord.RichEmbed()
			.setTitle(`Channel Info - ${channel.name}`)
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter(`ID: ${channel.id}`)
			.addField("Created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
			.addField("Type", capitalize(channel.type), true)
			.addField("Category Parent", channel.parent ? channel.parent.name : "None", true)
			.addField("Has permission overwrites", channel.permissionOverwrites.size == 0 ? "No" : "Yes", true)
			
			if (channel.type == "text") {
				channelEmbed.addField("Topic", channel.topic ? channel.topic : "No topic set");
			} else if (channel.type == "voice") {
				channelEmbed.addField("User Limit", channel.userLimit == 0 ? "No limit" : channel.userLimit, true)
				.addField("Bitrate", `${channel.bitrate} bits`, true)
			}
	
			message.channel.send(channelEmbed);
		}
	},
	class EvalCommand extends Command {
		constructor() {
			super({
				name: "eval",
				description: "Evaluate JavaScript code",
				allowDMs: true,
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				cooldown: {
					time: 0,
					type: "user"
				},
				flags: [
					{
						name: "console",
						desc: "Puts the result in the console"
					}
				],
				hidden: true,
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 5
				},
				usage: "eval <code> [--console]"
			});
		}
		
		async run(bot, message, args, flags) {
			let consoleFlag = flags.find(f => f.name == "console");
			let toEval = args[0];
			let result, beginEvalDate, endEvalDate;
			try {
				beginEvalDate = Number(new Date());
				result = eval(toEval);
			} catch (err) {
				result = err;
				if (err && err.stack && !consoleFlag) result = err.stack;
			} finally {
				endEvalDate = Number(new Date());
			}

			if (consoleFlag) {
				if (typeof result == "function") result = result.toString();
				console.log(result);
				message.react("✅");
			} else {
				if (toEval.length > 1000) toEval = toEval.slice(0, 1000) + "...";
				if (result != undefined && result != null) {
					let result2 = result.toString();
					if (result2.length > 1000) result = result2.slice(0, 1000) + "...";
				}
				message.channel.send(new Discord.RichEmbed()
				.setTitle("discord.js Evaluator")
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter(`Execution took: ${endEvalDate - beginEvalDate}ms`)
				.setTimestamp(message.createdAt)
				.addField("Your code", "```javascript" + "\n" + toEval + "```")
				.addField("Result", "```javascript" + "\n" + result + "```")
				);
			}
		}
	},
	class RoleInfoCommand extends Command {
		constructor() {
			super({
				name: "roleinfo",
				description: "Get info about a role",
				aliases: ["role"],
				args: [
					{
						infiniteArgs: true,
						type: "role"
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
				usage: "roleinfo <role>"
			});
		}
		
		async run(bot, message, args, flags) {
			let role = args[0], rolePos = role.calculatedPosition;
	
			let createdDate = new Date(role.createdTimestamp);
	
			let roleMembers;
			if (!message.guild.large) {
				roleMembers = role.members;
			} else {
				await message.guild.fetchMembers()
				.then(g => {
					roleMembers = g.members.filter(mem => mem.roles.has(role.id));
				})
				.catch(err => {
					console.log(`Failed to fetch members: ${err}`)
					roleMembers = role.members;
				})
			}
	
			let guildRoles = message.guild.roles, nearbyRoles = [];
			for (let i = rolePos + 2; i > rolePos - 3; i--) {
				if (i < 0 || i >= guildRoles.size) continue;
				let roleName = guildRoles.find(r => r.calculatedPosition == i).name;
				nearbyRoles.push(i == rolePos ? `**${roleName}**` : roleName);
			}
	
			message.channel.send(new Discord.RichEmbed()
			.setTitle(`Role Info - ${role.name}`)
			.setColor(role.color)
			.setFooter(`ID: ${role.id}`)
			.addField("Role created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
			.addField(`Members in Role [${roleMembers.size} total]`,
			`${roleMembers.filter(roleMem => roleMem.user.presence.status != "offline").size} Online`,
			true)
			.addField("Color", role.hexColor, true)
			.addField("Position from top", `${guildRoles.size - rolePos} / ${guildRoles.size}`, true)
			.addField("Displays separately (hoisted)", role.hoist ? "Yes" : "No", true)
			.addField("Mentionable", role.mentionable ? "Yes" : "No", true)
			.addField("Managed", role.managed ? "Yes" : "No", true)
			.addField("Role order", nearbyRoles.join(" > "))
			);
		}
	},
	class RoleListCommand extends Command {
		constructor() {
			super({
				name: "rolelist",
				description: "Get the server's roles",
				aliases: ["roles"],
				args: [
					{
						optional: true,
						type: "number",
						min: 1
					}
				],
				cooldown: {
					time: 30000,
					type: "guild"
				},
				flags: [
					{
						name: "ordered",
						desc: "Whether the list should be ordered according to position"
					},
				],
				perms: {
					bot: ["ADD_REACTIONS", "EMBED_LINKS", "MANAGE_MESSAGES"],
					user: [],
					level: 0
				},
				usage: "rolelist [page] [--ordered]"
			});
		}
		
		async run(bot, message, args, flags) {
			let entries = message.guild.roles.array();
			let orderedFlag = flags.find(f => f.name == "ordered");
			if (orderedFlag) entries.sort((a, b) => b.calculatedPosition - a.calculatedPosition);
			paginator.paginate(message, {title: `List of roles - ${message.guild.name}`}, [entries.map(role => role.name)], {
				limit: 20,
				numbered: orderedFlag ? true : false,
				page: args[0] ? args[0] : 1,
				params: null
			});
		}
	},
	class ServerInfoCommand extends Command {
		constructor() {
			super({
				name: "serverinfo",
				description: "Get info about this server",
				aliases: ["guild", "guildinfo", "server"],
				cooldown: {
					time: 120000,
					type: "guild"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}
		
		async run(bot, message, args, flags) {
			let guild = message.guild, guildMembers;
			if (!guild.large) {
				guildMembers = guild.members;
			} else {
				await guild.fetchMembers()
				.then(g => {guildMembers = g.members})
				.catch(err => {
					console.error(`Failed to fetch members: ${err}`)
					guildMembers = guild.members;
				})
			}
	
			let createdDate = new Date(guild.createdTimestamp),
				guildVerif;
			switch (guild.verificationLevel) {
				case 0:
					guildVerif = "None";
					break;
				case 1:
					guildVerif = "Low (verified email)";
					break;
				case 2:
					guildVerif = "Medium (registered for 5 mins)";
					break;
				case 3:
					guildVerif = "High (member for 10 mins)";
					break;
				case 4:
					guildVerif = "Very High (verified phone)";
			}
			let onlineCount = guild.presences.filter(p => p.status != "offline").size,
				botCount = guildMembers.filter(mem => mem.user.bot).size;
	
			message.channel.send(new Discord.RichEmbed()
			.setTitle(`Server Info - ${guild.name}`)
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter(`ID: ${guild.id} | Server data as of`)
			.setThumbnail(guild.iconURL)
			.setTimestamp(message.createdAt)
			.addField("Created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
			.addField("Owner", `${guild.owner.user.tag} \`(ID ${guild.owner.id})\``)
			.addField("Region", guild.region, true)
			.addField("Verification", guildVerif, true)
			.addField("Explicit Filter", guild.explicitContentFilter == 0 ? "None" : (guild.explicitContentFilter == 1 ? "Low" : "High"), true)
			.addField(`Members [${guild.memberCount} total]`,
			`${onlineCount} Online (${(onlineCount / guild.memberCount * 100).toFixed(1)}%)\n` +
			`${botCount} Bots (${(botCount / guild.memberCount * 100).toFixed(1)}%)`,
			true)
			.addField(`Roles [${guild.roles.size} total]`, "Use `rolelist` to see all roles", true)
			.addField(`Channels [${guild.channels.size} total]`,
			`${guild.channels.filter(chnl => chnl.type == "text").size} Text\n` +
			`${guild.channels.filter(chnl => chnl.type == "voice").size} Voice\n` +
			`${guild.channels.filter(chnl => chnl.type == "category").size} Categories`,
			true)
			);
		}
	},
	class UserInfoCommand extends Command {
		constructor() {
			super({
				name: "userinfo",
				description: "Get info about a user",
				aliases: ["user"],
				args: [
					{
						infiniteArgs: true,
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
			.addField(`Roles - ${member.roles.size}`, member.roles.array().join(", "))
	
			if (member.displayColor != 0 || (member.colorRole && member.colorRole.color == 0)) {
				userEmbed.setColor(member.displayColor);
			}
			message.channel.send(userEmbed);
		}
	}
]
