const fs = require("fs"),
	twemoji = require("twemoji"),
	fetchMembers = require("../modules/memberFetcher.js");

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
			if (list.length > 0) {return list} else {return null}
		case "command":
			const command = bot.commands.get(obj) || bot.commands.get(bot.aliases.get(obj));
			if (command) {return command} else {return null}
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
			if (fs.existsSync(file)) {
				return {
					isEmoji: true,
					content: fs.readFileSync(file)
				};
			} else {
				return null;
			}
		case "member":
			const memberMatch = obj.match(memberRegex);
			let member;

			if (memberMatch) {
				member = message.guild.large ? await getMember(memberMatch[0].match(/\d+/)[0]) : message.guild.members.get(memberMatch[0].match(/\d+/)[0]);
				return member ? [member] : null;
			}
			member = message.guild.members.get(obj);

			if (member) {
				return member ? [member] : null;
			} else {
				const guildMembers = message.guild.large ? await fetchMembers(message) : message.guild.members,
					comparedObj = obj.toLowerCase();
				list = guildMembers.filter(mem => {
					return mem.user.tag.toLowerCase().includes(comparedObj) ||
						mem.user.username.toLowerCase().includes(comparedObj) ||
						mem.displayName.toLowerCase().includes(comparedObj);
				}).array();
			}
			if (list.length > 0) {return list} else {return null}
		case "number":
			if (!isNaN(obj) && obj >= params.min && obj <= params.max) {return parseInt(obj)} else {return null}
		case "oneof":
			if (params.list.includes(obj)) {return obj} else {return null}
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
			if (list.length > 0) {return list} else {return null}
		case "string":
			return obj.toString();
		default:
			throw new Error("Invalid argument type to check");
	}
};