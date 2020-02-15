const {fetchMembers} = require("../modules/memberFetcher.js"),
	convert = require("color-convert"),
	twemoji = require("twemoji");

const colorRegexes = [
		/^#?[0-9a-f]{6}$/i,
		/^rgb\((\d{1,3},){2}\d{1,3}\)$/i,
		/^hsl\((\d{1,3},){2}\d{1,3}\)$/i,
		/^c(my|ym)k\((\d{1,3},){2}\d{1,3}\)$/i,
		/^decimal:\d{1,8}$/i,
		/^(\d{1,3},){2}\d{1,3}$/,
		/^[a-z]+$/i
	],
	emojiRegex = /^<a?:[0-9A-Za-z_]{2,}:\d{17,19}>$/,
	memberRegex = /^<@!?\d{17,19}>$/;

async function getMember(message, id) {
	let member = null;
	await message.guild.fetchMember(id).then(mem => member = mem).catch(() => {});
	return member;
}

function getListableObjects(rawTestObjs, testRegex, key) {
	// Check regex matches first
	const objRegexMatch = key.match(testRegex);
	if (objRegexMatch) {
		const objFromRegex = rawTestObjs.get(objRegexMatch[0].match(/\d+/)[0]);
		return objFromRegex ? [objFromRegex] : null;
	} else {
		const objFromRegex = rawTestObjs.get(key);
		if (objFromRegex) return [objFromRegex];
	}

	// Now check name matches
	const lowerKey = key.toLowerCase();
	const exactMatches = [],
		inclusiveMatches = [];
	for (const obj of rawTestObjs.values()) {
		if (obj.name.toLowerCase().includes(lowerKey)) {
			inclusiveMatches.push(obj);
			if (obj.name == key) exactMatches.push(obj);
		}
	}
	if (exactMatches.length == 1) return exactMatches;
	return inclusiveMatches.length > 0 ? inclusiveMatches : null;
}

module.exports.resolve = async (bot, message, obj, type, params) => {
	const lowerObj = obj.toLowerCase();
	switch (type) {
		case "boolean":
			if (["yes", "y", "true", "enable"].includes(lowerObj)) return true;
			return ["no", "n", "false", "disable"].includes(lowerObj) ? false : null;
		case "channel":
			return getListableObjects(message.guild.channels, /^<#\d{17,19}>$/, obj);
		case "color": {
			const objWithNoSpaces = lowerObj.replace(/[ %]/g, "").toLowerCase();
			let i, colorMatch;
			for (i = 0; i < colorRegexes.length; i++) {
				const matched = objWithNoSpaces.match(colorRegexes[i]);
				if (matched) {colorMatch = matched[0]; break}
			}
			switch (i) {
				case 0: // #rrggbb or rrggbb | e.g. #112233 or 112233
					return parseInt(colorMatch.replace("#", ""), 16);
				case 1: { // rgb(r,g,b) | e.g. rgb(1,2,3)
					const rgbValues = colorMatch.slice(4, colorMatch.length - 1).split(",");
					return rgbValues.some(value => value > 255) ? null :
						parseInt(rgbValues[0]) * 65536 + parseInt(rgbValues[1]) * 256 + parseInt(rgbValues[2]);
				}
				case 2: { // hsl(h,s,l) | e.g. hsl(1,2,3)
					const hslValues = colorMatch.slice(4, colorMatch.length - 1).split(",");
					if (hslValues[0] >= 360 || hslValues[1] > 100 || hslValues[2] > 100) return null;
					const hslRgbValues = convert.hsl.rgb(hslValues);
					return hslRgbValues[0] * 65536 + hslRgbValues[1] * 256 + hslRgbValues[2];
				}
				case 3: { // cmyk(c,m,y,k) | e.g. cmyk(1,2,3,4)
					const cmykValues = colorMatch.slice(5, colorMatch.length - 1).split(",");
					if (cmykValues.some(value => value > 100)) return null;
					const cmykRgbValues = convert.cmyk.rgb(cmykValues);
					return cmykRgbValues[0] * 65536 + cmykRgbValues[1] * 256 + cmykRgbValues[2];
				}
				case 4: { // decimal:number | e.g. decimal:1234
					const decimalValue = parseInt(colorMatch.slice(8));
					return decimalValue < 16777216 ? decimalValue : null;
				}
				case 5: { // r,g,b | e.g. 1,2,3
					const rgbValues = colorMatch.split(",");
					return rgbValues.some(value => value > 255) ? null :
						parseInt(rgbValues[0]) * 65536 + parseInt(rgbValues[1]) * 256 + parseInt(rgbValues[2]);
				}
				case 6: { // CSS color name | e.g. blue
					const nameRgbValues = convert.keyword.rgb(colorMatch);
					return nameRgbValues ? nameRgbValues[0] * 65536 + nameRgbValues[1] * 256 + nameRgbValues[2] : null;
				}
				default:
					return null;
			}
		}
		case "command":
			return bot.commands.get(lowerObj) || bot.commands.get(bot.aliases.get(lowerObj)) || null;
		case "emoji":
			return getListableObjects(message.guild.emojis, emojiRegex, obj);
		case "float": {
			const num = parseFloat(obj);
			return !isNaN(num) && num >= params.min && num <= params.max ? num : null;
		}
		case "function":
			return params.testFunction(obj) ? obj : null;
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
				const emojiID = emojiMatch[0].match(/\d+/)[0],
					emojiExtension = /^<a:/.test(emojiMatch[0]) ? "gif" : "png";
				return `https://cdn.discordapp.com/emojis/${emojiID}.${emojiExtension}`;
			}

			// The src attribute gets extracted from the resulting <img> tag string
			const parsedEmoji = twemoji.parse(obj, {folder: "svg", ext: ".svg"}),
				i = parsedEmoji.indexOf("https://twemoji.maxcdn.com/v/");

			return i != -1 ? {isEmoji: true, content: parsedEmoji.slice(i, parsedEmoji.indexOf(".svg", i) + 4)} : null;
		}
		case "member": {
			const memberMatch = obj.match(memberRegex), allowRaw = params.allowRaw;
			let member;

			if (memberMatch) {
				member = message.guild.large ? await getMember(message, memberMatch[0].match(/\d+/)[0]) :
					message.guild.members.get(memberMatch[0].match(/\d+/)[0]);
				return member ? [member] : (allowRaw ? obj : null);
			} else if (/^\d{17,19}$/.test(obj)) {
				member = message.guild.large ? await getMember(message, obj.match(/\d+/)[0]) : message.guild.members.get(obj.match(/\d+/)[0]);
				if (member) return [member];
			}

			const guildMembers = message.guild.large ? await fetchMembers(message) : message.guild.members;
			const inclusiveMatches = [];
			for (const mem of guildMembers.values()) {
				if (mem.user.tag.toLowerCase().includes(lowerObj)) {
					inclusiveMatches.push(mem);
					if (mem.user.tag == obj) return [mem];
				} else if (mem.user.username.toLowerCase().includes(lowerObj) || mem.displayName.toLowerCase().includes(lowerObj)) {
					inclusiveMatches.push(mem);
				}
			}
			return inclusiveMatches.length > 0 ? inclusiveMatches : (allowRaw ? obj : null);
		}
		case "number": {
			const num = Math.floor(obj);
			return !isNaN(num) && num >= params.min && num <= params.max ? num : null;
		}
		case "oneof":
			return params.list.includes(lowerObj) ? lowerObj : null;
		case "role": {
			const guildRoles = message.guild.roles.clone();
			guildRoles.delete(message.guild.defaultRole.id);
			return getListableObjects(guildRoles, /^<@&\d{17,19}>$/, obj);
		}
		case "string":
			return obj.toString();
		default:
			throw new Error("Invalid argument type to check");
	}
};
