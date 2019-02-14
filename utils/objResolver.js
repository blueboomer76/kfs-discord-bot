const {fetchMembers} = require("../modules/memberFetcher.js"),
	fs = require("fs"),
	twemoji = require("twemoji");

const emojiRegex = /^<a?:[0-9A-Za-z_]{2,}:\d{17,19}>$/,
	memberRegex = /^<@!?\d{17,19}>$/;

async function getMember(message, id) {
	let member;
	await message.guild.fetchMember(id).then(mem => member = mem).catch(() => member = null);
	return member;
}

module.exports.resolve = async (bot, message, obj, type, params) => {
	const lowerObj = obj.toLowerCase();
	let list;
	switch (type) {
		case "boolean":
			if (["yes", "y", "true", "enable"].includes(lowerObj)) {
				return true;
			} else if (["no", "n", "false", "disable"].includes(lowerObj)) {
				return false;
			} else {
				return null;
			}
		case "channel":
			const guildChannels = message.guild.channels,
				channelMatch = obj.match(/^<#\d{17,19}>$/);
			let channel;
			if (channelMatch) {
				channel = guildChannels.get(channelMatch[0].match(/\d+/)[0]);
				if (channel) {return [channel]} else {return null}
			} else {
				channel = guildChannels.get(obj);
				if (channel) return [channel];
			}

			list = guildChannels.array().filter(chnl => {
				return chnl.name.toLowerCase().includes(lowerObj);
			});
			if (list.length > 0) {return list} else {return null}
		case "command":
			const command = bot.commands.get(lowerObj) || bot.commands.get(bot.aliases.get(lowerObj));
			if (command) {return command} else {return null}
		case "emoji":
			const guildEmojis = message.guild.emojis,
				emojiMatch = obj.match(emojiRegex);
			let emoji;
			if (emojiMatch) {
				emoji = guildEmojis.get(emojiMatch[0].match(/\d+/)[0]);
				if (emoji) {return [emoji]} else {return null}
			} else {
				emoji = guildEmojis.get(obj);
				if (emoji) return [emoji];
			}

			list = guildEmojis.array().filter(emoji => {
				return emoji.name.toLowerCase().includes(lowerObj);
			});
			if (list.length > 0) {return list} else {return null}
		case "function":
			const testFunction = params.testFunction;
			if (testFunction(obj)) {return obj} else {return null}
		case "image":
			if (memberRegex.test(obj)) {
				const guildMembers = message.guild.large ? await fetchMembers(message) : message.guild.members,
					member = guildMembers.get(obj.match(/\d+/)[0]);
				if (member) {
					return member.user.avatarURL || `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`;
				} else {
					return null;
				}
			}
			if (/^https?:\/\/.+\.(gif|jpe?g|png)$/i.test(obj)) return obj;
			const emojiMatch2 = obj.match(emojiRegex);
			if (emojiMatch2) {
				const emojiID = emojiMatch2[0].match(/\d+/)[0],
					emojiExtension = /^<a:/.test(emojiMatch2[0]) ? "gif" : "png";
				return `https://cdn.discordapp.com/emojis/${emojiID}.${emojiExtension}`;
			}

			const twemojiResults = [];
			twemoji.replace(obj, match => {
				twemojiResults.push(match);
				return match;
			});
			if (twemojiResults.length == 0) return null;
			const twemojiCode = twemoji.convert.toCodePoint(twemojiResults[0]);
			let file = `node_modules/twemoji/2/svg/${twemojiCode}.svg`;
			if (fs.existsSync(file)) {
				return {
					isEmoji: true,
					content: fs.readFileSync(file)
				};
			} else {
				file = `node_modules/twemoji/2/svg/${twemojiCode.split("-", 1)}.svg`;
				if (fs.existsSync(file)) {
					return {
						isEmoji: true,
						content: fs.readFileSync(file)
					};
				} else {
					return null;
				}
			}
		case "member":
			const memberMatch = obj.match(memberRegex);
			let member;

			if (memberMatch) {
				member = message.guild.large ? await getMember(message, memberMatch[0].match(/\d+/)[0]) : message.guild.members.get(memberMatch[0].match(/\d+/)[0]);
				return member ? [member] : null;
			} else if (/^\d{17,19}$/.test(obj)) {
				member = message.guild.large ? await getMember(message, obj.match(/\d+/)[0]) : message.guild.members.get(obj.match(/\d+/)[0]);
				if (member) return [member];
			}

			const guildMembers = message.guild.large ? await fetchMembers(message) : message.guild.members;
			list = guildMembers.filter(mem => {
				return mem.user.tag.toLowerCase().includes(lowerObj) ||
				mem.user.username.toLowerCase().includes(lowerObj) ||
				mem.displayName.toLowerCase().includes(lowerObj);
			}).array();
			if (list.length > 0) {return list} else {return null}
		case "number":
			const num = Math.floor(obj);
			if (!isNaN(num) && num >= params.min && num <= params.max) {return num} else {return null}
		case "oneof":
			if (params.list.includes(lowerObj)) {return lowerObj} else {return null}
		case "role":
			const guildRoles = message.guild.roles.clone();
			guildRoles.delete(guildRoles.find(role => role.calculatedPosition == 0).id);

			const roleMatch = obj.match(/^<@&\d{17,19}>$/);
			let role;
			if (roleMatch) {
				role = guildRoles.get(roleMatch[0].match(/\d+/)[0]);
				if (role) {return [role]} else {return null}
			} else {
				role = guildRoles.get(obj);
				if (role) return [role];
			}

			list = guildRoles.array().filter(role => {
				return role.name.toLowerCase().includes(lowerObj);
			});
			if (list.length > 0) {return list} else {return null}
		case "string":
			return obj.toString();
		default:
			throw new Error("Invalid argument type to check");
	}
};
