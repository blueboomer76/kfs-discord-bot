const {MessageEmbed} = require("discord.js"),
	Command = require("../structures/command.js"),
	{capitalize, getDuration, getStatuses} = require("../modules/functions.js"),
	{fetchMembers} = require("../modules/memberFetcher.js"),
	Paginator = require("../utils/paginator.js"),
	convert = require("color-convert"),
	math = require("mathjs"),
	util = require("util");

function getDateAndDurationString(timestamp) {
	const dateString = new Date(timestamp).toUTCString(),
		duration = getDuration(timestamp);
	return dateString + ` (${duration})`;
}

module.exports = [
	class AvatarCommand extends Command {
		constructor() {
			super({
				name: "avatar",
				description: "Get a user's avatar. You can also provide any user ID even if outside this server",
				aliases: ["profilepic", "pfp"],
				args: [
					{
						allowRaw: true,
						infiniteArgs: true,
						optional: true,
						type: "member"
					}
				],
				cooldown: {
					time: 15000,
					type: "channel"
				},
				flags: [
					{
						name: "format",
						desc: "The file format to output (one of GIF, JPG, PNG, WEBP)",
						arg: {
							type: "oneof",
							allowedValues: ["gif", "jpg", "png", "webp"]
						}
					},
					{
						name: "size",
						desc: "The size of the avatar (can be 16, 32, 64 ... 4096)",
						arg: {
							type: "oneof",
							allowedValues: ["16", "32", "64", "128", "256", "512", "1024", "2048", "4096"]
						}
					}
				],
				usage: "avatar [user] [--format <gif/jpg/png/webp>] [--size <number>]"
			});
		}

		async run(bot, message, args, flags) {
			let user;
			if (typeof args[0] == "string") {
				if (/^\d{17,19}$/.test(args[0])) {
					user = await bot.users.fetch(args[0]).catch(() => {});
				}
				if (!user) {
					const userArgs = args[0].length > 1500 ? args[0].slice(0, 1500) + "..." : args[0];
					return {cmdWarn: "No users found matching `" + userArgs + "`"};
				}
			} else {
				user = (args[0] && args[0].user) || message.author;
			}

			const formatFlag = flags.find(f => f.name == "format"),
				sizeFlag = flags.find(f => f.name == "size");
			const avatarURL = user.avatarURL({
				format: formatFlag ? formatFlag.args : "png",
				dynamic: true,
				size: sizeFlag ? parseInt(sizeFlag.args) : undefined
			}) || `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
			message.channel.send(new MessageEmbed()
				.setTitle("Avatar - " + user.tag)
				.setDescription("Avatar URL: " + avatarURL)
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
			const channel = args[0] || message.channel;
			let accessible = "No";
			if (channel.permissionsFor(message.guild.roles.everyone).has("VIEW_CHANNEL")) {
				accessible = channel.permissionsFor(message.guild.roles.everyone).has("READ_MESSAGE_HISTORY") ? "Yes" : "Partial";
			}

			const channelEmbed = new MessageEmbed()
				.setTitle("Channel Info - " + channel.name)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter("ID: " + channel.id)
				.addField("Channel created at", getDateAndDurationString(channel.createdTimestamp))
				.addField("Type", capitalize(channel.type), true)
				.addField("Category Parent", channel.parent ? channel.parent.name : "None", true)
				.addField("Accessible to everyone", accessible, true);

			const uncategorized = message.guild.channels.cache.filter(c => c.type != "category" && !c.parent);
			let channels, pos = 0;
			if (uncategorized.has(channel.id)) {
				channels = uncategorized.array().sort((a, b) => a.position - b.position);
			} else {
				const categoryID = channel.type == "category" ? channel.id : channel.parent.id,
					categoryChannels = message.guild.channels.cache.array().filter(c => c.type == "category")
						.sort((a, b) => a.position - b.position);
				pos += uncategorized.size + 1;

				let categoryParent = categoryChannels[0], i = 0;
				while (categoryParent.id != categoryID) {
					pos += categoryParent.children.size + 1;
					i++;
					categoryParent = categoryChannels[i];
				}
				channels = categoryParent.children.array().sort((a, b) => a.position - b.position);
			}
			if (channel.type != "category") {
				const textChannels = channels.filter(c => c.type == "text");
				if (channel.type == "text") {
					pos += textChannels.findIndex(c => c.id == channel.id);
				} else {
					const voiceChannels = channels.filter(c => c.type == "voice");
					pos += textChannels.length + voiceChannels.findIndex(c => c.id == channel.id);
				}
				pos++;
			}
			channelEmbed.addField("Position", pos + " / " + message.guild.channels.cache.size, true);

			if (channel.type == "text") {
				channelEmbed.addField("NSFW", channel.nsfw ? "Yes" : "No", true)
					.addField("Topic", channel.topic || "No topic set");
			} else if (channel.type == "voice") {
				channelEmbed.addField("User Limit", channel.userLimit == 0 ? "None" : channel.userLimit, true)
					.addField("Bitrate", channel.bitrate + " bits", true);
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
						type: "color"
					}
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				},
				usage: "color <hex color | rgb(0-255,0-255,0-255) | 0-255,0-255,0-255 | color name | decimal:0-16777215 | hsl(0-359,0-100,0-100) | cmyk(0-100,0-100,0-100,0-100)>"
			});
		}

		async run(bot, message, args, flags) {
			const decimalValue = parseInt(args[0]),
				rgbValues = [Math.floor(decimalValue / 65536), Math.floor(decimalValue / 256) % 256, decimalValue % 256],
				colorName = convert.rgb.keyword(rgbValues),
				cmykValues = convert.rgb.cmyk(rgbValues),
				hexValue = convert.rgb.hex(rgbValues),
				hslValues = convert.rgb.hsl(rgbValues),
				hsvValues = convert.rgb.hsv(rgbValues),
				xyzValues = convert.rgb.xyz(rgbValues),
				grayscaleValue = Math.round(convert.rgb.gray.raw(rgbValues) * 2.55);

			message.channel.send(new MessageEmbed()
				.setTitle("Color - #" + hexValue)
				.setDescription(`**Nearest CSS Color Name**: ${colorName}\n` +
					`**Hexadecimal (Hex)**: #${hexValue}\n` +
					`**RGB**: rgb(${rgbValues.join(", ")})\n` +
					`**Decimal (Integer)**: ${decimalValue}\n` +
					`**HSL**: hsl(${hslValues[0]}, ${hslValues[1]}%, ${hslValues[2]}%)\n` +
					`**CMYK**: cmyk(${cmykValues[0]}%, ${cmykValues[1]}%, ${cmykValues[2]}%, ${cmykValues[3]}%)\n` +
					`**HSV**: hsv(${hsvValues[0]}, ${hsvValues[1]}%, ${hsvValues[2]}%)\n` +
					`**XYZ**: XYZ(${xyzValues.join(", ")})`)
				.setColor(decimalValue)
				.addField("Related colors", `**Grayscale**: rgb(${(grayscaleValue + ", ").repeat(2) + grayscaleValue})\n` +
					`**Inverted**: rgb(${rgbValues.map(v => 255 - v).join(", ")})`)
			);
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
			const emoji = args[0];
			let emojiRoleList;
			if (emoji.roles.cache.size == 0) {
				emojiRoleList = "All roles";
			} else {
				emojiRoleList = emoji.roles.cache.map(role => role.name).join(", ");
				if (emojiRoleList.length > 1000) emojiRoleList = emojiRoleList.slice(0, 1000) + "...";
			}

			message.channel.send(new MessageEmbed()
				.setTitle("Emoji - " + emoji.name)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter("ID: " + emoji.id)
				.setImage(emoji.url)
				.addField("Emoji created at", getDateAndDurationString(emoji.createdTimestamp))
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
					},
					{
						name: "promise",
						desc: "Wait for the promise to resolve to a value if there is one"
					}
				],
				hidden: true,
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 5
				},
				usage: "eval <code> [--console] [--inspect] [--promise]"
			});
		}

		async run(bot, message, args, flags) {
			const consoleFlag = flags.some(f => f.name == "console");
			let isPromise = flags.some(f => f.name == "promise");
			let rawRes, beginEval, endEval;
			try {
				beginEval = process.hrtime();
				rawRes = eval(args[0]);
				if (isPromise && rawRes instanceof Promise) {
					rawRes = await rawRes.catch(err => this.getErrorString(err, consoleFlag));
				}
			} catch (err) {
				rawRes = this.getErrorString(err, consoleFlag);
				isPromise = false;
			} finally {
				endEval = process.hrtime();
			}

			const ns = (endEval[0] - beginEval[0]) * 1e+9 + (endEval[1] - beginEval[1]);
			let evalTime;
			if (ns < 100000) {
				evalTime = (ns / 1000).toPrecision(3) + "μs";
			} else if (ns < 1e+9) {
				evalTime = (ns / 1000000).toPrecision(3) + "ms";
			} else {
				evalTime = Math.round(ns / 1000000) + "ms";
			}

			const res = typeof rawRes == "function" ? rawRes.toString() : rawRes;
			if (consoleFlag) {
				console.log(res);
				message.react("✅");
			} else {
				const rawCodeFieldText = args[0].length > 1000 ? args[0].slice(0, 1000) + "..." : args[0],
					evalEmbed = new MessageEmbed()
						.setTitle("discord.js Evaluator")
						.setColor(Math.floor(Math.random() * 16777216))
						.setFooter("Execution took: " + evalTime)
						.setTimestamp(message.createdAt)
						.addField("Input Code", "```javascript" + "\n" + rawCodeFieldText + "```");
				let resToSend = flags.some(f => f.name == "inspect") && typeof rawRes != "function" ? util.inspect(res) : res;

				// Check if the result is longer than the allowed field length
				let isLongResult = false;
				if (resToSend != undefined && resToSend != null) {
					resToSend = resToSend.toString().replace(new RegExp(bot.token, "g"), "[Bot Token]");
					isLongResult = resToSend.length > 1000;
				}
				if (isLongResult) {
					console.log(res);
					evalEmbed
						.addField(isPromise ? "Promise Result" : "Result",
							"```javascript\n" + resToSend.toString().slice(0, 1000) + "...```")
						.addField("Note", "The full result has been logged in the console.");
				} else {
					evalEmbed.addField(isPromise ? "Promise Result" : "Result", "```javascript\n" + resToSend + "```");
				}

				message.channel.send(evalEmbed);
			}
		}

		getErrorString(err, isConsole) {
			if (err instanceof Error && err.stack && !isConsole) {
				return err.stack.split("    ", 3).join("    ") + "    ...";
			}
			return err;
		}
	},
	class MathCommand extends Command {
		constructor() {
			super({
				name: "math",
				description: "Calculate a math expression",
				aliases: ["calc", "calculate"],
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				usage: "math <expression>"
			});
		}

		async run(bot, message, args, flags) {
			let result;
			try {
				result = math.evaluate(args[0]);
			} catch (err) {
				return {cmdWarn: "Failed to evaluate expression: " + err.message};
			}
			message.channel.send(result);
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
				rolePos = role.position,
				guildRoles = message.guild.roles.cache.array();
			guildRoles.splice(guildRoles.findIndex(r => r.position == 0), 1);

			const nearbyRoles = [],
				startPos = Math.min(rolePos + 2, guildRoles.length),
				endPos = Math.max(rolePos - 2, 1);
			for (let i = startPos; i >= endPos; i--) {
				const roleName = guildRoles.find(r => r.position == i).name;
				nearbyRoles.push(i == rolePos ? `**${roleName}**` : roleName);
			}

			const roleInfoEmbed = new MessageEmbed()
				.setTitle("Role Info - " + role.name)
				.setColor(role.color)
				.setFooter("ID: " + role.id)
				.addField("Role created at", getDateAndDurationString(role.createdTimestamp));

			if (bot.intents.has("GUILD_MEMBERS")) {
				const hasGuildPresencesIntent = bot.intents.has("GUILD_PRESENCES");
				const guildMembers = await fetchMembers(message, hasGuildPresencesIntent);
				const roleMembers = guildMembers.filter(mem => mem.roles.cache.has(role.id));

				roleInfoEmbed.addField(`Members in Role [${roleMembers.size} total]`,
					hasGuildPresencesIntent ? getStatuses(roleMembers).notOffline + " Online" :
						"No Additional Data Available", true);
			} else {
				roleInfoEmbed.addField("Members in Role", "No Data", true);
			}

			roleInfoEmbed
				.addField("Color", "Hex: " + role.hexColor + "\nDecimal: " + role.color, true)
				.addField("Position from top", (guildRoles.length - rolePos + 1) + " / " + guildRoles.length, true)
				.addField("Displays separately (hoisted)", role.hoist ? "Yes" : "No", true)
				.addField("Mentionable", role.mentionable ? "Yes" : "No", true)
				.addField("Managed", role.managed ? "Yes" : "No", true)
				.addField("Role order", nearbyRoles.join(" > "));

			message.channel.send(roleInfoEmbed);
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
					}
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
			const roles = message.guild.roles.cache.array();
			roles.splice(roles.findIndex(r => r.position == 0), 1);
			if (orderedFlag) roles.sort((a, b) => b.position - a.position);
			new Paginator(message, [roles.map(role => role.name)], {title: "List of roles - " + message.guild.name}, {
				noStop: true,
				numbered: orderedFlag,
				page: args[0] || 1,
				removeReactAfter: 60000
			}).start();
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
			if (!bot.intents.has("GUILD_MEMBERS")) return {cmdErr: "This command cannot be run since no data is available."};

			const role = args[0],
				guildMembers = await fetchMembers(message),
				roleMembers = guildMembers.filter(mem => mem.roles.cache.has(role.id));

			if (roleMembers.size == 0) return {cmdWarn: `There are no members in the role **${role.name}**.`};
			if (roleMembers.size > 250) return {cmdWarn: `There are more than 250 members in the role **${role.name}**.`};

			new Paginator(message, [roleMembers.map(m => m.user.tag)], {title: "List of members in role - " + role.name}, {
				embedColor: role.color,
				noStop: true,
				removeReactAfter: 60000
			}).start();
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
			const guild = message.guild;

			const channels = {text: 0, voice: 0, category: 0};
			for (const channel of guild.channels.cache.values()) channels[channel.type]++;

			const serverInfoEmbed = new MessageEmbed()
				.setTitle("Server Info - " + guild.name)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter(`ID: ${guild.id} | Server stats as of`)
				.setThumbnail(guild.iconURL({format: "png", dynamic: true}))
				.setTimestamp(message.createdAt)
				.addField("Server created at", getDateAndDurationString(guild.createdTimestamp))
				.addField("Owner", `${guild.owner.user.tag} \`(ID ${guild.owner.id})\``)
				.addField("Region", guild.region, true)
				.addField("Verification", capitalize(guild.verificationLevel), true)
				.addField("Explicit Filter", guild.explicitContentFilter == 0 ? "None" : (guild.explicitContentFilter == 1 ? "Low" : "High"), true)
				.addField("2-Factor Auth Required", guild.mfaLevel == 0 ? "No" : "Yes", true);

			if (bot.intents.has(["GUILD_MEMBERS", "GUILD_PRESENCES"])) {
				const guildMembers = await fetchMembers(message, true);
				const botCount = guildMembers.filter(mem => mem.user.bot).size;
				const statuses = getStatuses(guild.members.cache, guild.memberCount - guild.members.cache.size);

				serverInfoEmbed.addField(`Members [${guild.memberCount} total]`,
					`${statuses.online} Online, ${statuses.idle} Idle, ${statuses.dnd} DND ` +
						`(${(statuses.notOffline / guild.memberCount * 100).toFixed(1)}%) /\n` +
						statuses.offline + " Offline\n" +
					`${botCount} Bots (${(botCount / guild.memberCount * 100).toFixed(1)}%)`,
					true);
			} else {
				serverInfoEmbed.addField(`Members [${guild.memberCount} total]`, "No Other Data Available", true);
			}

			serverInfoEmbed
				.addField(`Roles [${guild.roles.cache.size - 1} total]`, "Use `rolelist` to see all roles", true)
				.addField(`Channels [${guild.channels.cache.size} total]`,
					channels.text + " Text\n" + channels.voice + " Voice\n" + channels.category + " Categories", true);

			message.channel.send(serverInfoEmbed);
		}
	},
	class UserInfoCommand extends Command {
		constructor() {
			super({
				name: "userinfo",
				description: "Get info about a user. You can also provide any user ID to get info even if outside this server",
				aliases: ["member", "memberinfo", "user"],
				args: [
					{
						infiniteArgs: true,
						optional: true,
						type: "member",
						allowRaw: true
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
			let user, member;
			if (typeof args[0] == "string") {
				if (/^\d{17,19}$/.test(args[0])) {
					user = await bot.users.fetch(args[0]).catch(() => {});
				}
				if (!user) {
					const userArgs = args[0].length > 1500 ? args[0].slice(0, 1500) + "..." : args[0];
					return {cmdWarn: "No users found matching `" + userArgs + "`"};
				}
			} else {
				member = args[0] || message.member;
				user = member.user;
			}

			const userEmbed = new MessageEmbed()
				.setTitle("User Info - " + user.tag)
				.setFooter("ID: " + user.id)
				.setThumbnail(user.avatarURL({format: "png", dynamic: true}) || `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`)
				.addField("Account created at", getDateAndDurationString(user.createdTimestamp));

			if (member) userEmbed.addField("Joined this server at", getDateAndDurationString(member.joinedTimestamp));

			if (bot.intents.has("GUILD_PRESENCES")) {
				const rawPresence = (member && member.presence) || user.presence,
					presence = rawPresence.status == "dnd" ? "Do Not Disturb" : capitalize(rawPresence.status);
				let customStatus = "",
					activityString = "";
				for (const activity of rawPresence.activities) {
					if (activity.type == "CUSTOM_STATUS") {
						customStatus = "\n" + "__Custom Status__: " + activity.state;
					} else {
						const typeString = activity.type == "LISTENING" ? "Listening to" : capitalize(activity.type);
						activityString += "\n__" + typeString + "__ " + activity.name;
					}
				}

				userEmbed.addField("Status", presence + customStatus + activityString, true);
			} else {
				userEmbed.addField("Status", "No Data");
			}

			if (member) {
				userEmbed.addField("Bot user", user.bot ? "Yes" : "No", true)
					.addField("Nickname", member.nickname || "None", true);

				if (bot.intents.has("GUILD_MEMBERS")) {
					const guildMembers = await fetchMembers(message),
						guildMemArray = guildMembers.array().sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
					const joinPos = guildMemArray.findIndex(mem => mem.joinedTimestamp == member.joinedTimestamp),
						nearbyMems = [],
						startPos = Math.max(joinPos - 2, 0),
						endPos = Math.min(joinPos + 2, message.guild.memberCount - 1);
					for (let i = startPos; i <= endPos; i++) {
						nearbyMems.push(i == joinPos ? `**${guildMemArray[i].user.username}**` : guildMemArray[i].user.username);
					}

					userEmbed.addField("Member #", joinPos + 1, true)
						.addField("Join order", nearbyMems.join(" > "));
				}

				const memRoles = [];
				for (const role of member.roles.cache.values()) {
					if (role.position == 0) continue;
					memRoles.push(role.name);
				}

				let roleList;
				if (memRoles.length == 0) {
					roleList = "None";
				} else {
					roleList = memRoles.join(", ");
					if (roleList.length > 1000) roleList = roleList.slice(0, 1000) + "...";
				}

				userEmbed.addField("Roles - " + memRoles.length, roleList);

				if (member.displayColor != 0 || (member.roles.color && member.roles.color.color == 0)) {
					userEmbed.setColor(member.displayColor);
				}
			}

			message.channel.send(userEmbed);
		}
	}
];
