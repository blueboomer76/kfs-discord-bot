const {RichEmbed} = require("discord.js"),
	Command = require("../structures/command.js"),
	{capitalize, getDuration} = require("../modules/functions.js"),
	paginator = require("../utils/paginator.js");

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
			const member = args[0] ? args[0] : message.member,
				avatarURL = member.user.avatarURL ? member.user.avatarURL : `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`
			message.channel.send(new RichEmbed()
			.setTitle(`Avatar - ${member.user.tag}`)
			.setColor(Math.floor(Math.random() * 16777216))
			.setDescription(`Avatar URL: ${avatarURL}`)
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
					level: 0,
				},
				usage: "channelinfo [channel]"
			});
		}
		
		async run(bot, message, args, flags) {
			const channel = args[0] ? args[0] : message.channel,
				createdDate = new Date(channel.createdTimestamp),
				channelPosition = channel.type == "category" ? channel.position : channel.calculatedPosition,
				channelEmbed = new RichEmbed()
					.setTitle(`Channel Info - ${channel.name}`)
					.setColor(Math.floor(Math.random() * 16777216))
					.setFooter(`ID: ${channel.id}`)
					.addField("Created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
					.addField("Type", capitalize(channel.type), true)
					.addField("Category Parent", channel.parent ? channel.parent.name : "None", true)
					.addField("Accessible to everyone", channel.permissionsFor(message.guild.id).has("READ_MESSAGES") ? "Yes" : "No", true)
			
			let posInfo = channel.type == "voice" ? "voice" : "text and category";
			channelEmbed.addField(`Relative position to ${posInfo} channels`, channelPosition + 1, true)
			
			if (channel.type == "text") {
				channelEmbed.addField("Topic", channel.topic && channel.topic.length > 0 ? channel.topic : "No topic set")
			} else if (channel.type == "voice") {
				channelEmbed.addField("Limit", channel.userLimit == 0 ? "No limit" : channel.userLimit, true)
				.addField("Bitrate", `${channel.bitrate} bits`, true)
			}
			
			message.channel.send(channelEmbed);
			
			// Others found: Disabled command(s) & features
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
					}
				],
				hidden: true,
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 5
				},
				usage: "eval <code>"
			});
		}
		
		async run(bot, message, args, flags) {
			let res, beginEval, endEval, consoleFlag = flags.find(f => f.name == "console");
			try {
				beginEval = Number(new Date());
				res = eval(args[0]);
			} catch (err) {
				res = err.stack;
				if (!consoleFlag) res = `${res.split("    ", 3).join("    ")}    ...`;
			} finally {
				endEval = Number(new Date());
			}
			if (consoleFlag) {
				if (typeof res == "function") res = res.toString();
				console.log(res);
				message.react("✅");
			} else {
				let toEval = args[0].length < 1000 ? args[0] : args[0].slice(0,1000);
				if (res != undefined && res != null && res.toString().length > 1000) {
					res = `${res.toString().slice(0,1000)}...`
				};
				message.channel.send(new RichEmbed()
				.setTitle("discord.js Evaluator")
				.setColor(Math.floor(Math.random() * 16777216))
				.setTimestamp(message.createdAt)
				.setFooter(`Execution took: ${endEval - beginEval}ms`)
				.addField("Your code", "```javascript" + "\n" + toEval + "```")
				.addField("Result", "```javascript" + "\n" + res + "```")
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
					level: 0,
				},
				usage: "roleinfo <role>"
			});
		}
		
		async run(bot, message, args, flags) {
			const role = args[0], rolePos = role.calculatedPosition;
			let roleMembers, guildRoles = message.guild.roles, nearbyRoles = [];
				
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
			
			for (let i = rolePos + 2; i > rolePos - 3; i--) {
				if (i < 0 || i >= guildRoles.size) continue;
				let roleName = guildRoles.find(r => r.calculatedPosition == i).name;
				nearbyRoles.push(i == rolePos ? `**${roleName}**` : roleName);
			}
			
			const createdDate = new Date(role.createdTimestamp);
			
			message.channel.send(new RichEmbed()
			.setTitle(`Role Info - ${role.name}`)
			.setColor(role.color)
			.setFooter(`ID: ${role.id}`)
			.addField("Role created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
			.addField(`Members in Role [${roleMembers.size} total]`,
			`${roleMembers.filter(roleMem => roleMem.user.presence.status != "offline").size} Online`,
			true)
			.addField("Color", role.hexColor, true)
			.addField("Position from top", `${message.guild.roles.size - rolePos} / ${message.guild.roles.size}`, true)
			.addField("Displays separately (hoisted)", role.hoist ? "Yes" : "No", true)
			.addField("Mentionable", role.mentionable ? "Yes" : "No", true)
			.addField("Managed", role.managed ? "Yes" : "No", true)
			.addField("Role order", `${nearbyRoles.join(" > ")}`)
			);
		}
	},
	class RoleListCommand extends Command {
		constructor() {
			super({
				name: "rolelist",
				description: "Get the guild's roles",
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
					bot: ["EMBED_LINKS", "MANAGE_MESSAGES"],
					user: [],
					level: 0
				},
				usage: "rolelist [page] [--ordered]"
			});
		}
		
		async run(bot, message, args, flags) {
			const entries = message.guild.roles.array(), orderedFlag = flags.find(f => f.name == "ordered");
			if (orderedFlag) entries.sort((a,b) => b.position - a.position);	
			paginator.paginate(message, {title: `List of roles - ${message.guild.name}`}, [entries.map(role => role.name)], {
				limit: 25,
				noStop: true,
				numbered: orderedFlag ? true : false,
				page: args[0] ? args[0] : 1,
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
			const role = args[0], roleMembers = message.guild.members.array().filter(mem => mem.roles.has(role.id));
			
			// Need to add await get guild members here
			
			if (roleMembers.length == 0) return {cmdWarn: `There are no members in the role ${role.name}.`}
			if (roleMembers.length >= 250) return {cmdWarn: `There are more than 250 members in the role ${role.name}.`}
					
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
			let guild = message.guild, guildMembers;
			if (!guild.large) {
				guildMembers = guild.members;
			} else {
				await guild.fetchMembers()
				.then(g => guildMembers = g.members)
				.catch(err => {
					console.log(`Failed to fetch members: ${err}`)
					guildMembers = guild.members;
				})
			}
			
			const botCount = guildMembers.filter(mem => mem.user.bot).size,
				createdDate = new Date(guild.createdTimestamp);
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
			
			message.channel.send(new RichEmbed()
			.setTitle(`Server Info - ${guild.name}`)
			.setColor(Math.floor(Math.random() * 16777216))
			.setThumbnail(guild.iconURL)
			.setFooter(`ID: ${guild.id} | Server stats as of`)
			.setTimestamp(message.createdAt)
			.addField("Created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
			.addField("Owner", `${guild.owner.user.tag} \`(ID ${guild.ownerID})\``)
			.addField("Region", guild.region, true)
			.addField("Verification", guildVerif, true)
			.addField("Explicit Filter", guild.explicitContentFilter == 0 ? "None" : (guild.explicitContentFilter == 1 ? "Low" : "High"), true)
			.addField(`Members [${guild.memberCount} total]`,
			`${guild.presences.size} Online (${(guild.presences.size / guild.memberCount * 100).toFixed(1)}%)\n${botCount} Bots (${(botCount / guild.memberCount * 100).toFixed(1)}%)`,
			true)
			.addField(`Roles [${guild.roles.size} total]`, "`k,rolelist` to see all roles", true)
			.addField(`Channels [${guild.channels.size} total]`,
			`${message.guild.channels.filter(chnl => chnl.type == "text").size} Text\n` +
			`${message.guild.channels.filter(chnl => chnl.type == "voice").size} Voice\n` +
			`${message.guild.channels.filter(chnl => chnl.type == "category").size} Categories`,
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
			let member = args[0] ? args[0] : message.member, guildMembers, userRoles = member.roles.array();
			
			userRoles.splice(userRoles.findIndex(role => role.id == message.guild.id), 1);
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
			
			let userEmbed = new RichEmbed()
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
]