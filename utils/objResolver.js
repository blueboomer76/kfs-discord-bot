const {fetchMembers} = require("../modules/memberFetcher.js"),
	convert = require("color-convert"),
	fs = require("fs"),
	twemoji = require("twemoji");

const colorRegexes = [
		/#?[0-9a-f]{6}/i,
		/rgb\((\d{1,3},){2}\d{1,3}\)/i,
		/hsl\((\d{1,3},){2}\d{1,3}\)/i,
		/decimal:\d{1,8}/i,
		/(\d{1,3},){2}\d{1,3}/,
		/^[a-z]+/i
	],
	emojiRegex = /<a?:[0-9A-Za-z_]{2,}:\d{17,19}>/,
	memberRegex = /<@!?\d{17,19}>/;

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
				channelMatch = obj.match(/<#\d{17,19}>/);
			let channel;
			if (channelMatch) {
				channel = guildChannels.get(channelMatch[0].match(/\d+/)[0]);
				return channel ? [channel] : null;
			} else {
				channel = guildChannels.get(obj);
				if (channel) return [channel];
			}

			list = guildChannels.array().filter(chnl => chnl.name.toLowerCase().includes(lowerObj));
			return list.length > 0 ? list : null;
		case "color":
			const objWithNoSpaces = lowerObj.replace(/[ %]/g, "").toLowerCase();
			let i, colorMatch;
			for (i = 0; i < colorRegexes.length; i++) {
				const matched = objWithNoSpaces.match(colorRegexes[i]);
				if (matched) {colorMatch = matched[0]; break}
			}
			switch (i) {
				case 0: // #rrggbb or rrggbb | e.g. #112233 or 112233
					return parseInt(colorMatch.replace("#", ""), 16);
				case 1: // rgb(r,g,b) | e.g. rgb(1,2,3)
					const rgbValues = colorMatch.slice(4, colorMatch.length - 1).split(",");
					return rgbValues.some(value => value > 255) ? null : parseInt(rgbValues[0]) * 65536 + parseInt(rgbValues[1]) * 256 + parseInt(rgbValues[2]);
				case 2: // hsl(h,s,l) | e.g. hsl(1,2,3)
					const hslValues = colorMatch.slice(4, colorMatch.length - 1).split(",");
					if (hslValues[0] >= 360 || hslValues[1] > 100 || hslValues[2] > 100) return null;
					const hslRgbValues = convert.hsl.rgb(hslValues);
					return hslRgbValues[0] * 65536 + hslRgbValues[1] * 256 + hslRgbValues[2];
				case 3: // decimal:number | e.g. decimal:1234
					const decimalValue = parseInt(colorMatch.slice(8));
					return decimalValue < 16777216 ? decimalValue : null;
				case 4: // r,g,b | e.g. 1,2,3
					const rgbValues2 = colorMatch.split(",");
					return rgbValues2.some(value => value > 255) ? null : parseInt(rgbValues2[0]) * 65536 + parseInt(rgbValues2[1]) * 256 + parseInt(rgbValues2[2]);
				case 5: // CSS color name | e.g. blue
					const nameRgbValues = convert.keyword.rgb(colorMatch);
					return nameRgbValues ? nameRgbValues[0] * 65536 + nameRgbValues[1] * 256 + nameRgbValues[2] : null;
				default:
					return null;
			}
		case "command":
			return bot.commands.get(lowerObj) || bot.commands.get(bot.aliases.get(lowerObj)) || null;
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
				return {isEmoji: true, content: fs.readFileSync(file)};
			} else {
				file = `node_modules/twemoji/2/svg/${twemojiCode.split("-", 1)}.svg`;
				if (fs.existsSync(file)) {
					return {isEmoji: true, content: fs.readFileSync(file)};
				} else {
					return null;
				}
			}
		case "member":
			const memberMatch = obj.match(memberRegex), allowRaw = params.allowRaw;
			let member;

			if (memberMatch) {
				member = message.guild.large ? await getMember(message, memberMatch[0].match(/\d+/)[0]) : message.guild.members.get(memberMatch[0].match(/\d+/)[0]);
				return member ? [member] : (allowRaw ? obj : null);
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
			return list.length > 0 ? list : (allowRaw ? obj : null);
		case "number":
			const num = Math.floor(obj);
			return !isNaN(num) && num >= params.min && num <= params.max ? num : null;
		case "oneof":
			return params.list.includes(lowerObj) ? lowerObj : null;
		case "role":
			const guildRoles = message.guild.roles.clone();
			guildRoles.delete(guildRoles.find(role => role.calculatedPosition == 0).id);

			const roleMatch = obj.match(/<@&\d{17,19}>/);
			let role;
			if (roleMatch) {
				role = guildRoles.get(roleMatch[0].match(/\d+/)[0]);
				return role ? [role] : null;
			} else {
				role = guildRoles.get(obj);
				if (role) return [role];
			}

			list = guildRoles.array().filter(role => role.name.toLowerCase().includes(lowerObj));
			return list.length > 0 ? list : null;
		case "string":
			return obj.toString();
		default:
			throw new Error("Invalid argument type to check");
	}
};
