const {RichEmbed} = require("discord.js"),
	Command = require("../structures/command.js"),
	{capitalize, getDuration} = require("../modules/functions.js"),
	{fetchMembers} = require("../modules/memberFetcher.js"),
	paginator = require("../utils/paginator.js"),
	util = require("util");

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
			const member = args[0] || message.member,
				avatarURL = member.user.avatarURL || `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`;
			message.channel.send(new RichEmbed()
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
			const channel = args[0] || message.channel,
				createdDate = new Date(channel.createdTimestamp),
				channelEmbed = new RichEmbed()
					.setTitle(`Channel Info - ${channel.name}`)
					.setColor(Math.floor(Math.random() * 16777216))
					.setFooter(`ID: ${channel.id}`)
					.addField("Created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
					.addField("Type", capitalize(channel.type), true)
					.addField("Category Parent", channel.parent ? channel.parent.name : "None", true)
					.addField("Accessible to everyone", channel.permissionsFor(message.guild.roles.find(r => r.calculatedPosition == 0)).has("VIEW_CHANNEL") ? "Yes" : "No", true);
			
			const channelPositions = message.guild.channels.filter(c => c.type == channel.type).map(c => c.calculatedPosition);
			channelPositions.sort((a, b) => a - b);
			channelEmbed.addField("Position to same type channels", channelPositions.indexOf(channel.calculatedPosition) + 1);

			if (channel.type == "text") {
				channelEmbed.addField("NSFW", channel.nsfw ? "Yes" : "No")
					.addField("Topic", channel.topic || "No topic set");
			} else if (channel.type == "voice") {
				channelEmbed.addField("User Limit", channel.userLimit == 0 ? "None" : channel.userLimit, true)
					.addField("Bitrate", `${channel.bitrate} bits`, true);
			}
	
			message.channel.send(channelEmbed);
		}
	},
	class EmojiCommand extends Command {
		constructor() {
			super({
				name: "emoji",
				description: "Get an enlarged emoji along with info",
				aliases: ["emojiinfo"],
				args: [
					{
						type: "emoji"
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
				usage: "emoji <emoji>"
			});
		}
		
		async run(bot, message, args, flags) {
			const emoji = args[0], createdDate = new Date(emoji.createdTimestamp);
			message.channel.send(new RichEmbed()
				.setTitle(`Emoji - ${emoji.name}`)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter(`ID: ${emoji.id}`)
				.setImage(emoji.url)
				.addField("Emoji created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
				.addField("Roles which can use this emoji", emoji.roles.size == 0 ? "All roles" : emoji.roles.array().map(role => role.name).join(", "))
				.addField("Animated", emoji.animated ? "Yes" : "No", true)
				.addField("Managed", emoji.managed ? "Yes" : "No", true)
				.addField("Emoji URL", emoji.url)
			);
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
					},
					{
						name: "inspect",
						desc: "Inspect the result using utils"
					}
				],
				hidden: true,
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 5
				},
				usage: "eval <code> [--console] [--inspect]"
			});
		}
		
		async run(bot, message, args, flags) {
			const consoleFlag = flags.some(f => f.name == "console");
			let result, beginEvalDate, endEvalDate;
			try {
				beginEvalDate = Number(new Date());
				result = eval(args[0]);
			} catch (err) {
				result = err instanceof Error && err.stack && !consoleFlag ? err.stack.split("    ", 3).join("    ") + "    ..." : err;
			} finally {
				endEvalDate = Number(new Date());
			}

			if (consoleFlag) {
				if (typeof result == "function") result = result.toString();
				console.log(result);
				message.react("✅");
			} else {
				const toEval = args[0].length < 1000 ? args[0] : args[0].slice(0, 1000),
					resToSend = flags.some(f => f.name == "inspect") ? util.inspect(result) : result,
					evalEmbed = new RichEmbed()
						.setTitle("discord.js Evaluator")
						.setColor(Math.floor(Math.random() * 16777216))
						.setFooter(`Execution took: ${endEvalDate - beginEvalDate}ms`)
						.setTimestamp(message.createdAt)
						.addField("Your code", "```javascript" + "\n" + toEval + "```");
				if (resToSend != undefined && resToSend != null && resToSend.toString().length > 1000) {
					console.log(result);
					evalEmbed.addField("Result", "```javascript" + "\n" + resToSend.toString().slice(0, 1000) + "..." + "```")
						.addField("Note", "The full result has been logged in the console.");
				} else {
					evalEmbed.addField("Result", "```javascript" + "\n" + resToSend + "```");
				}
				message.channel.send(evalEmbed);
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
			const role = args[0],
				rolePos = role.calculatedPosition,
				guildRoles = message.guild.roles.array();
			guildRoles.splice(guildRoles.findIndex(r => r.calculatedPosition == 0), 1);
	
			const createdDate = new Date(role.createdTimestamp),
				guildMembers = message.guild.large ? await fetchMembers(message) : message.guild.members,
				roleMembers = guildMembers.filter(mem => mem.roles.has(role.id)),
				nearbyRoles = [];
			for (let i = rolePos + 2; i > rolePos - 3; i--) {
				if (i <= 0 || i > guildRoles.length) continue;
				const roleName = guildRoles.find(r => r.calculatedPosition == i).name;
				nearbyRoles.push(i == rolePos ? `**${roleName}**` : roleName);
			}
	
			message.channel.send(new RichEmbed()
				.setTitle(`Role Info - ${role.name}`)
				.setColor(role.color)
				.setFooter(`ID: ${role.id}`)
				.addField("Role created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
				.addField(`Members in Role [${roleMembers.size} total]`,
					`${roleMembers.filter(roleMem => roleMem.user.presence.status != "offline").size} Online`,
					true)
				.addField("Color", role.hexColor, true)
				.addField("Position from top", `${guildRoles.length - rolePos + 1} / ${guildRoles.length}`, true)
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
			const orderedFlag = flags.find(f => f.name == "ordered");
			const roles = message.guild.roles.array();
			roles.splice(roles.findIndex(r => r.calculatedPosition == 0), 1);
			if (orderedFlag) roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition);
			paginator.paginate(message, {title: `List of roles - ${message.guild.name}`}, [roles.map(role => role.name)], {
				limit: 25,
				noStop: true,
				numbered: orderedFlag,
				page: args[0] || 1,
				params: null,
				removeReactAfter: 60000
			});
		}
	},
	class RoleMembersCommand extends Command {
		constructor() {
			super({
				name: "rolemembers",
				description: "See which members have a certain role",
				aliases: ["inrole", "rolemems"],
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
					bot: ["EMBED_LINKS", "MANAGE_MESSAGES"],
					user: [],
					level: 0
				},
				usage: "rolemembers <role>"
			});
		}
		
		async run(bot, message, args, flags) {
			const role = args[0],
				guildMembers = message.guild.large ? await fetchMembers(message) : message.guild.members,
				roleMembers = guildMembers.filter(mem => mem.roles.has(role.id));

			if (roleMembers.size == 0) return {cmdWarn: `There are no members in the role **${role.name}**.`};
			if (roleMembers.size > 250) return {cmdWarn: `There are more than 250 members in the role **${role.name}**.`};

			paginator.paginate(message, {title: `List of members in role - ${role.name}`}, [roleMembers.map(m => m.user.tag)], {
				embedColor: role.color,
				limit: 25,
				noStop: true,
				numbered: false,
				page: 1,
				params: null,
				removeReactAfter: 60000
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
			const guild = message.guild,
				guildMembers = message.guild.large ? await fetchMembers(message) : message.guild.members;
			
			const createdDate = new Date(guild.createdTimestamp);
			let guildVerif;
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
			
			const onlineCount = guild.presences.filter(p => p.status != "offline").size,
				botCount = guildMembers.filter(mem => mem.user.bot).size;
	
			message.channel.send(new RichEmbed()
				.setTitle(`Server Info - ${guild.name}`)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter(`ID: ${guild.id} | Server stats as of`)
				.setThumbnail(guild.iconURL)
				.setTimestamp(message.createdAt)
				.addField("Created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
				.addField("Owner", `${guild.owner.user.tag} \`(ID ${guild.owner.id})\``)
				.addField("Region", guild.region, true)
				.addField("Verification", guildVerif, true)
				.addField("Explicit Filter", guild.explicitContentFilter == 0 ? "None" : (guild.explicitContentFilter == 1 ? "Low" : "High"), true)
				.addField("2-Factor Auth Required", guild.mfaLevel == 0 ? "No" : "Yes", true)
				.addField(`Members [${guild.memberCount} total]`,
					`${onlineCount} Online (${(onlineCount / guild.memberCount * 100).toFixed(1)}%)\n` +
					`${botCount} Bots (${(botCount / guild.memberCount * 100).toFixed(1)}%)`,
					true)
				.addField(`Roles [${guild.roles.size - 1} total]`, "Use `rolelist` to see all roles", true)
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
				aliases: ["member", "memberinfo", "user"],
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
			const member = args[0] || message.member;

			const createdDate = new Date(member.user.createdTimestamp),
				joinedDate = new Date(member.joinedTimestamp);

			const rawPresence = member.presence;
			let presence;
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

			const guildMembers = message.guild.large ? await fetchMembers(message) : message.guild.members,
				guildMemArray = guildMembers.array();
			guildMemArray.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);

			const joinPos = guildMemArray.findIndex(mem => mem.joinedTimestamp == member.joinedTimestamp),
				nearbyMems = [];
			for (let i = joinPos - 2; i < joinPos + 3; i++) {
				if (i < 0 || i >= message.guild.memberCount) continue;
				nearbyMems.push(i == joinPos ? `**${guildMemArray[i].user.username}**` : guildMemArray[i].user.username);
			}

			let memRoles = member.roles.array();
			memRoles.splice(memRoles.findIndex(role => role.calculatedPosition == 0), 1);
			memRoles = memRoles.map(role => role.name);
			
			const userEmbed = new RichEmbed()
				.setTitle(`User Info - ${member.user.tag}`)
				.setFooter(`ID: ${member.id}`)
				.setThumbnail(member.user.avatarURL || `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`)
				.addField("Account created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
				.addField("Joined this server at", `${joinedDate.toUTCString()} (${getDuration(joinedDate)})`)
				.addField("Status", presence, true)
				.addField("Bot user", member.user.bot ? "Yes" : "No", true)
				.addField("Nickname", member.nickname || "None", true)
				.addField("Member #", joinPos + 1, true)
				.addField("Join order", nearbyMems.join(" > "))
				.addField(`Roles - ${memRoles.length}`, memRoles.length == 0 ? "None" : memRoles.join(", "));
	
			if (member.displayColor != 0 || (member.colorRole && member.colorRole.color == 0)) {
				userEmbed.setColor(member.displayColor);
			}
			message.channel.send(userEmbed);
		}
	}
];
