const {RichEmbed} = require("discord.js"),
	Command = require("../structures/command.js"),
	{capitalize, getDuration} = require("../modules/functions.js"),
	{fetchMembers} = require("../modules/memberFetcher.js"),
	paginator = require("../utils/paginator.js"),
	convert = require("color-convert"),
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
			
			const uncategorized = message.guild.channels.filter(c => c.type != "category" && !c.parent);
			let channels, pos = 0;
			if (uncategorized.has(channel.id)) {
				channels = uncategorized.array().sort((a, b) => a.calculatedPosition - b.calculatedPosition);
			} else {
				const categoryID = channel.type == "category" ? channel.id : channel.parent.id,
					catChannels = message.guild.channels.filter(c => c.type == "category").array().sort((a, b) => a.calculatedPosition - b.calculatedPosition);
				pos += uncategorized.size;

				let chnlParent;
				for (const cat of catChannels) {
					chnlParent = cat;
					pos++;
					if (chnlParent.id == categoryID) break;
					pos += cat.children.size;
				}
				channels = chnlParent.children.array().sort((a, b) => a.calculatedPosition - b.calculatedPosition);
			}
			if (channel.type != "category") {
				const textChannels = channels.filter(c => c.type == "text"),
					voiceChannels = channels.filter(c => c.type == "voice");
				if (channel.type == "text") {
					pos += textChannels.findIndex(c => c.id == channel.id);
				} else {
					pos += textChannels.length + voiceChannels.findIndex(c => c.id == channel.id);
				}
				pos++;
			}
			channelEmbed.addField("Position", pos + " / " + message.guild.channels.size, true);
			
			if (channel.type == "text") {
				channelEmbed.addField("NSFW", channel.nsfw ? "Yes" : "No", true)
					.addField("Topic", channel.topic || "No topic set");
			} else if (channel.type == "voice") {
				channelEmbed.addField("User Limit", channel.userLimit == 0 ? "None" : channel.userLimit, true)
					.addField("Bitrate", `${channel.bitrate} bits`, true);
			}
	
			message.channel.send(channelEmbed);
		}
	},
	class ColorCommand extends Command {
		constructor() {
			super({
				name: "color",
				description: "Get information about a color",
				aliases: ["colour"],
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				},
				usage: "color <hex color | rgb(0-255,0-255,0-255) | 0-255,0-255,0-255 | color name | decimal:0-16777215 | hsl(0-359,0-100,0-100) | cmyk(0-100,0-100,0-100,0-100)>"
			});
			this.colorRegexes = [
				/^#?[0-9a-f]{6}$/i,
				/^rgb\((\d{1,3},){2}\d{1,3}\)$/i,
				/^hsl\((\d{1,3},){2}\d{1,3}\)$/i,
				/^c(my|ym)k\((\d{1,3},){3}\d{1,3}\)$/i,
				/^decimal:\d{1,8}$/i,
				/^(\d{1,3},){2}\d{1,3}$/,
				/^[a-z]+$/i
			];
		}
		
		async run(bot, message, args, flags) {
			const argWithNoSpaces = args[0].replace(/[ %]/g, "");
			let i, colorRegexMatch;
			for (i = 0; i < this.colorRegexes.length; i++) {
				const matched = argWithNoSpaces.match(this.colorRegexes[i]);
				if (matched) {colorRegexMatch = matched[0]; break}
			}
			if (colorRegexMatch) {
				let colorName, cmykValues, decimalValue, hexValue, hslValues, rgbValues;

				switch (i) {
					case 0: // #rrggbb or rrggbb | e.g. #112233 or 112233
						hexValue = colorRegexMatch.replace("#", "");
						rgbValues = [
							parseInt(hexValue.slice(0, 2), 16),
							parseInt(hexValue.slice(2, 4), 16),
							parseInt(hexValue.slice(4, 6), 16)
						];
						break;
					case 1: // rgb(r,g,b) | e.g. rgb(1,2,3)
						rgbValues = colorRegexMatch.slice(4, colorRegexMatch.length - 1).split(",").map(val => {
							return parseInt(val);
						});
						if (rgbValues.some(value => value > 255)) return {cmdWarn: "RGB values must be between 0 and 255"};
						break;
					case 2: // hsl(h,s,l) | e.g. hsl(1,2,3)
						hslValues = colorRegexMatch.slice(4, colorRegexMatch.length - 1).split(",");
						if (hslValues[1] >= 360) return {cmdWarn: "The first HSL value must be between 0 and 359"};
						if (hslValues[1] > 100 || hslValues[2] > 100) return {cmdWarn: "The second and third HSL values must be between 0 and 100"};
						rgbValues = convert.hsl.rgb(hslValues);
						break;
					case 3: // cmyk(c,m,y,k) | e.g. cmyk(1,2,3,4)
						cmykValues = colorRegexMatch.slice(4, colorRegexMatch.length - 1).split(",");
						if (cmykValues.some(value => value > 100)) return {cmdWarn: "CMYK values must be between 0 and 100"};
						rgbValues = convert.cmyk.rgb(cmykValues);
						break;	
					case 4: // decimal:number | e.g. decimal:1234
						decimalValue = parseInt(colorRegexMatch.slice(8));
						if (decimalValue > 16777215) return {cmdWarn: "Decimal value must be between 0 and 16777215."};
						rgbValues = [Math.floor(decimalValue / 65536), Math.floor(decimalValue / 256) % 256, decimalValue % 256];
						break;
					case 5: // r,g,b | e.g. 1,2,3
						rgbValues = colorRegexMatch.split(",").map(val => {
							return parseInt(val);
						});
						if (rgbValues.some(value => value > 255)) return {cmdWarn: "RGB values must be between 0 and 255"};
						break;
					case 6: // CSS color name | e.g. blue
						colorName = colorRegexMatch;
						rgbValues = convert.keyword.rgb(colorName);
						if (!rgbValues) return {cmdWarn: "Invalid color name"};
				}

				if (i != 6) colorName = convert.rgb.keyword(rgbValues);
				if (i != 3) cmykValues = convert.rgb.cmyk(rgbValues);
				if (i != 4) decimalValue = 65536 * rgbValues[0] + 256 * rgbValues[1] + 1 * rgbValues[2];
				if (i != 0) hexValue = convert.rgb.hex(rgbValues);
				if (i != 2) hslValues = convert.rgb.hsl(rgbValues);
				const hsvValues = convert.rgb.hsv(rgbValues);
				const xyzValues = convert.rgb.xyz(rgbValues);
				const grayscaleValue = Math.round(convert.rgb.gray.raw(rgbValues) * 2.55);

				message.channel.send(new RichEmbed()
					.setTitle("Color - " + argWithNoSpaces)
					.setDescription(`**Nearest CSS Color Name**: ${colorName}` + "\n" +
					`**Hexadecimal (Hex)**: #${hexValue}` + "\n" +
					`**RGB**: rgb(${rgbValues.join(", ")})` + "\n" + 
					`**Decimal (Integer)**: ${decimalValue}` + "\n" +
					`**HSL**: hsl(${hslValues[0]}, ${hslValues[1]}%, ${hslValues[2]}%)` + "\n" +
					`**CMYK**: cmyk(${cmykValues[0]}%, ${cmykValues[1]}%, ${cmykValues[2]}%, ${cmykValues[3]}%)` + "\n" +
					`**HSV**: hsv(${hsvValues[0]}, ${hsvValues[1]}%, ${hsvValues[2]}%)` + "\n" +
					`**XYZ**: XYZ(${xyzValues.join(", ")})`)
					.setColor(decimalValue)
					.addField("Related colors", `**Grayscale**: rgb(${(grayscaleValue + ", ").repeat(2) + grayscaleValue})` + "\n" +
					`**Inverted**: rgb(${rgbValues.map(v => 255 - v).join(", ")})`)
				);
			} else {
				return {cmdWarn: "Invalid color."};
			}
		}
	},
	class EmojiCommand extends Command {
		constructor() {
			super({
				name: "emoji",
				description: "Get a custom emoji along with info",
				aliases: ["emojiinfo"],
				args: [
					{
						infiniteArgs: true,
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
				usage: "emoji <custom emoji>"
			});
		}
		
		async run(bot, message, args, flags) {
			const emoji = args[0],
				createdDate = new Date(emoji.createdTimestamp);

			let emojiRoleList;
			if (emoji.roles.size == 0) {
				emojiRoleList = "All roles";
			} else {
				emojiRoleList = emoji.roles.map(role => role.name).join(", ");
				if (emojiRoleList.length > 1000) emojiRoleList = emojiRoleList.slice(0, 1000) + "...";
			}

			message.channel.send(new RichEmbed()
				.setTitle(`Emoji - ${emoji.name}`)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter(`ID: ${emoji.id}`)
				.setImage(emoji.url)
				.addField("Emoji created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
				.addField("Roles which can use this emoji", emojiRoleList)
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
			let rawRes, beginEvalDate, endEvalDate;
			try {
				beginEvalDate = Date.now();
				rawRes = eval(args[0]);
			} catch (err) {
				rawRes = err instanceof Error && err.stack && !consoleFlag ? err.stack.split("    ", 3).join("    ") + "    ..." : err;
			} finally {
				endEvalDate = Date.now();
			}

			const res = typeof rawRes == "function" ? rawRes.toString() : rawRes;
			if (consoleFlag) {
				console.log(res);
				message.react("✅");
			} else {
				const toEval = args[0].length > 1000 ? args[0].slice(0, 1000) + "..." : args[0],
					resToSend = flags.some(f => f.name == "inspect") && typeof rawRes != "function" ? util.inspect(res) : res,
					evalEmbed = new RichEmbed()
						.setTitle("discord.js Evaluator")
						.setColor(Math.floor(Math.random() * 16777216))
						.setFooter(`Execution took: ${endEvalDate - beginEvalDate}ms`)
						.setTimestamp(message.createdAt)
						.addField("Your code", "```javascript" + "\n" + toEval + "```");
				if (resToSend != undefined && resToSend != null && resToSend.toString().length > 1000) {
					console.log(res);
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
				.addField("Color", `Hex: ${role.hexColor}` + "\n" + `Decimal: ${role.color}`, true)
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
					bot: ["ADD_REACTIONS", "EMBED_LINKS", "MANAGE_MESSAGES"],
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

			let roleList;
			if (memRoles.length == 0) {
				roleList = "None";
			} else {
				roleList = memRoles.join(", ");
				if (roleList.length > 1000) roleList = roleList.slice(0, 1000) + "...";
			}

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
				.addField(`Roles - ${memRoles.length}`, roleList);
	
			if (member.displayColor != 0 || (member.colorRole && member.colorRole.color == 0)) {
				userEmbed.setColor(member.displayColor);
			}
			message.channel.send(userEmbed);
		}
	}
];
