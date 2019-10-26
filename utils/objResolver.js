const {fetchMembers} = require("../modules/memberFetcher.js"),
	fs = require("fs"),
	convert = require("color-convert"),
	twemoji = require("twemoji");

const colorRegexes = [
		/^decimal:\d{1,8}$/,
		/^#?[0-9a-f]{6}$/,
		/^rgb\((\d{1,3},){2}\d{1,3}\)/,
		/^[a-z]+/,
		/^(\d{1,3},){2}\d{1,3}$/,
		/^hsl\((\d{1,3},){2}\d{1,3}\)/,
		/^c(my|ym)k\((\d{1,3},){2}\d{1,3}\)/
	],
	emojiRegex = /<a?:[0-9A-Za-z_]{2,}:\d+>/,
	memberRegex = /<@!?\d+>/;

async function getMember(message, id) {
	let member = null;
	await message.guild.fetchMember(id).then(mem => member = mem).catch(() => {});
	return member;
}

module.exports.resolve = async (bot, message, obj, type, params) => {
	let list;
	switch (type) {
		case "boolean":
			if (["yes", "y", "true", "enable"].includes(obj)) return true;
			return ["no", "n", "false", "disable"].includes(obj) ? false : null;
		case "channel": {
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
		}
		case "color": {
			const objWithNoSpaces = obj.replace(/[ %]/g, "").toLowerCase();
			let i, colorMatch;
			for (i = 0; i < colorRegexes.length; i++) {
				const matched = objWithNoSpaces.match(colorRegexes[i]);
				if (matched) {colorMatch = matched[0]; break}
			}
			switch (i) {
				case 0: { // decimal:number | e.g. decimal:1234
					const decimalValue = parseInt(colorMatch.slice(8));
					return decimalValue < 16777216 ? decimalValue : null;
				}
				case 1: // #rrggbb or rrggbb | e.g. #112233 or 112233
					return parseInt(colorMatch.replace("#", ""), 16);
				case 2: { // rgb(r,g,b) | e.g. rgb(1,2,3)
					const rgbValues = colorMatch.slice(4, colorMatch.length - 1).split(",");
					return rgbValues.some(value => value > 255) ? null : parseInt(rgbValues[0]) * 65536 + parseInt(rgbValues[1]) * 256 + parseInt(rgbValues[2]);
				}
				case 3: { // CSS color name | e.g. blue
					const nameRgbValues = convert.keyword.rgb(colorMatch);
					return nameRgbValues ? nameRgbValues[0] * 65536 + nameRgbValues[1] * 256 + nameRgbValues[2] : null;
				}
				case 4: { // r,g,b | e.g. 1,2,3
					const rgbValues = colorMatch.split(",");
					return rgbValues.some(value => value > 255) ? null: parseInt(rgbValues[0]) * 65536 + parseInt(rgbValues[1]) * 256 + parseInt(rgbValues[2]);
				}
				case 5: { // hsl(h,s,l) | e.g. hsl(1,2,3)
					const hslValues = colorMatch.slice(4, colorMatch.length - 1).split(",");
					if (hslValues[1] > 100 || hslValues[2] > 100) return null;
					const hslRgbValues = convert.hsl.rgb(hslValues);
					return hslRgbValues[0] * 65536 + hslRgbValues[1] * 256 + hslRgbValues[2];
				}
				default:
					return null;
			}
		}
		case "command":
			return bot.commands.get(obj) || bot.commands.get(bot.aliases.get(obj)) || null;
		case "duration":
			// Coming soon
			break;
		case "emoji": {
			const guildEmojis = message.guild.emojis, emojiMatch = obj.match(emojiRegex);
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
		}
		case "float":
			return !isNaN(obj) && obj >= params.min && obj <= params.max ? parseFloat(obj) : null;
		case "function": {
			const testFunction = params.testFunction;
			return testFunction(obj) ? obj : null;
		}
		case "image": {
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
			const emojiMatch = obj.match(emojiRegex);
			if (emojiMatch) {
				const emojiId = emojiMatch[0].match(/\d+/)[0],
					emojiExtension = /^<a:/.test(emojiMatch[0]) ? "gif" : "png";
				return `https://cdn.discordapp.com/emojis/${emojiId}.${emojiExtension}`;
			}

			const twemojiResults = [];
			twemoji.replace(obj, match => {twemojiResults.push(match); return match});
			if (twemojiResults.length == 0) return null;
			const twemojiCode = twemoji.convert.toCodePoint(twemojiResults[0]),
				file = `node_modules/twemoji/2/svg/${twemojiCode}.svg`;
			return fs.existsSync(file) ? {isEmoji: true, content: fs.readFileSync(file)} : null;
		}
		case "member": {
			const memberMatch = obj.match(memberRegex), allowRaw = params.allowRaw;
			let member;

			if (memberMatch) {
				member = message.guild.large ? await getMember(message, memberMatch[0].match(/\d+/)[0]) : message.guild.members.get(memberMatch[0].match(/\d+/)[0]);
				return member ? [member] : (allowRaw ? obj : null);
			}
			member = message.guild.members.get(obj);

			if (member) {
				return member ? [member] : (allowRaw ? obj : null);
			} else {
				const guildMembers = message.guild.large ? await fetchMembers(message) : message.guild.members,
					comparedObj = obj.toLowerCase();
				list = guildMembers.array().filter(mem => {
					return mem.user.tag.toLowerCase().includes(comparedObj) ||
						mem.user.username.toLowerCase().includes(comparedObj) ||
						mem.displayName.toLowerCase().includes(comparedObj);
				});
			}
			return list.length > 0 ? list : (allowRaw ? obj : null);
		}
		case "number":
			return !isNaN(obj) && obj >= params.min && obj <= params.max ? parseInt(obj) : null;
		case "oneof":
			return params.list.includes(obj) ? obj : null;
		case "regex":
			// Coming soon
			break;
		case "role": {
			if (obj.toLowerCase() == "everyone" || obj == message.guild.id) return null;

			const guildRoles = message.guild.roles.clone();
			guildRoles.delete(message.guild.id);

			const roleMatch = obj.match(/<@&\d+>/);
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
		}
		case "string":
			return obj.toString();
		default:
			throw new Error("Invalid argument type to check");
	}
};