const fs = require("fs"),
	twemoji = require("twemoji"),
	{fetchMembers} = require("../modules/memberFetcher.js");

const emojiRegex = /<a?:.{2,}:\d+>/,
	memberRegex = /<@!?\d+>/;

async function getMember(message, id) {
	let member;
	await message.guild.fetchMember(id).then(mem => member = mem).catch(() => member = null);
	return member;
}

module.exports.resolve = async (bot, message, obj, type, params) => {
	let list;
	switch (type) {
		case "boolean":
			if (["yes", "y", "true", "enable"].includes(obj)) {
				return true;
			} else if (["no", "n", "false", "disable"].includes(obj)) {
				return false;
			} else {return null}
		case "channel":
			const guildChannels = message.guild.channels, channelMatch = obj.match(/<#\d+>/);
			let channel;
			if (channelMatch) {
				return [guildChannels.get(channelMatch[0].match(/\d+/)[0])];
			} else {
				channel = guildChannels.get(obj);
			}
			if (channel) {
				return [channel];
			} else {
				list = guildChannels.array().filter(chnl => {
					return chnl.name.toLowerCase().includes(obj.toLowerCase());
				});
			}
			return list.length > 0 ? list : null;
		case "command":
			return bot.commands.get(obj) || bot.commands.get(bot.aliases.get(obj)) || null;
		case "duration":
			// Coming soon
			break;
		case "emoji":
			const guildEmojis = message.guild.emojis, emojiMatch = emojiRegex.match(obj);
			let emoji;
			if (emojiMatch) {
				return [guildEmojis.get(emojiMatch[0].match(/\d+/)[0])];
			} else {
				emoji = guildEmojis.get(obj);
			}
				
			if (emoji) {
				return [emoji];
			} else {
				list = guildEmojis.array().filter(emoji => {
					return emoji.name.toLowerCase().includes(obj.toLowerCase());
				});
			}
				
			return list.length > 0 ? list : null;
		case "function":
			const testFunction = params.testFunction;
			return testFunction(obj) ? obj : null;
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
				const emojiId = emojiMatch2[0].match(/\d+/)[0],
					emojiExtension = /^<a:/.test(emojiMatch2[0]) ? "gif" : "png";
				return `https://cdn.discordapp.com/emojis/${emojiId}.${emojiExtension}`;
			}

			const twemojiResults = [];
			twemoji.replace(obj, match => {
				twemojiResults.push(match);
				return match;
			});
			if (twemojiResults.length == 0) return null;
			const twemojiCode = twemoji.convert.toCodePoint(twemojiResults[0]),
				file = `node_modules/twemoji/2/svg/${twemojiCode}.svg`;
			return fs.existsSync(file) ? {isEmoji: true, content: fs.readFileSync(file)} : null;
		case "member":
			const memberMatch = obj.match(memberRegex), allowRaw = params.allowRaw;
			let member;

			if (memberMatch) {
				member = message.guild.large ? await getMember(memberMatch[0].match(/\d+/)[0]) : message.guild.members.get(memberMatch[0].match(/\d+/)[0]);
				return member ? [member] : (allowRaw ? obj : null);
			}
			member = message.guild.members.get(obj);

			if (member) {
				return member ? [member] : (allowRaw ? obj : null);
			} else {
				const guildMembers = message.guild.large ? await fetchMembers(message) : message.guild.members,
					comparedObj = obj.toLowerCase();
				list = guildMembers.filter(mem => {
					return mem.user.tag.toLowerCase().includes(comparedObj) ||
						mem.user.username.toLowerCase().includes(comparedObj) ||
						mem.displayName.toLowerCase().includes(comparedObj);
				}).array();
			}
			return list.length > 0 ? list : (allowRaw ? obj : null);
		case "number":
			return !isNaN(obj) && obj >= params.min && obj <= params.max ? parseInt(obj) : null;
		case "oneof":
			return params.list.includes(obj) ? obj : null;
		case "regex":
			// Coming soon
			break;
		case "role":
			if (obj == "everyone" || obj == message.guild.id) return null;
			const guildRoles = message.guild.roles, roleMatch = obj.match(/<@&\d+>/);
			let role;
			if (roleMatch) {
				return [guildRoles.get(roleMatch[0].match(/\d+/)[0])];
			} else {
				role = guildRoles.get(obj);
			}
			if (role) {
				return [role];
			} else {
				list = guildRoles.array().filter(role => {
					return role.name.toLowerCase().includes(obj.toLowerCase());
				});
			}
			return list.length > 0 ? list : null;
		case "string":
			return obj.toString();
		default:
			throw new Error("Invalid argument type to check");
	}
};