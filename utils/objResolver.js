const {Constants, DiscordAPIError} = require("discord.js"),
	{fetchMembers} = require("../modules/memberFetcher.js"),
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
	emojiRegex = /^<a?:[0-9A-Za-z_]{2,}:(\d{17,19})>$/,
	memberRegex = /^<@!?(\d{17,19})>$/;

let userFetcherFunction;

async function fetchMemberByID(message, id, allowRaw) {
	return await message.guild.members.fetch(id)
		.catch(err => {
			if (err instanceof DiscordAPIError && err.code == Constants.APIErrors.UNKNOWN_MEMBER && allowRaw) {
				return id;
			} else {
				return null;
			}
		});
}

function getUserFetcherFunction(bot) {
	if (bot.intents.has("GUILD_MEMBERS")) {
		userFetcherFunction = async (message, obj, allowRaw) => {
			const guildMembers = await fetchMembers(message);
			const lowerObj = obj.toLowerCase();

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
		};
	} else {
		// Limited user fetching due to intents
		userFetcherFunction = async (message, obj) => {
			return message.guild.members.fetch({query: obj, limit: 75})
				.then(members => {
					if (members.size != 0) {
						const memberArray = members.array();
						const discrimMatch = obj.match(/#\d{4}$/);
						if (discrimMatch) {
							const discrim = discrimMatch[0].match(/\d+/)[0];
							return memberArray.filter(m => m.discrim == discrim);
						}
						return memberArray;
					}
					return null;
				})
				.catch(() => null);
		};
	}
}

function getListableObjects(rawTestObjs, testRegex, key) {
	// Check regex matches first
	const objRegexMatch = key.match(testRegex);
	if (objRegexMatch) {
		const objFromRegex = rawTestObjs.get(objRegexMatch[1]);
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

module.exports.resolve = async (interaction, obj, argData) => {
	const bot = interaction.client;

	const lowerObj = obj.toLowerCase();
	switch (argData.parsedType) {
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
			return getListableObjects(interaction.guild.emojis.cache, emojiRegex, obj);
		case "function":
			return argData.parsedTypeParams.testFunction(obj) ? obj : null;
		case "image": {
			const memberMatch = obj.match(memberRegex);
			if (memberMatch) {
				const member = await fetchMemberByID(interaction, memberMatch[1], false);
				if (member) {
					return member.user.avatarURL({format: "png"}) || `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`;
				} else {
					return null;
				}
			}
			if (/^https?:\/\/.+\.(gif|jpe?g|png)$/i.test(obj)) return obj;
			if (lowerObj == "guild" || lowerObj == "server") return interaction.guild.iconURL({format: "png"}) || null;
			if (lowerObj == "avatar") return interaction.user.avatarURL({format: "png"}) || null;

			const emojiMatch = obj.match(emojiRegex);
			if (emojiMatch) {
				const emojiID = emojiMatch[1],
					emojiExtension = /^<a:/.test(emojiMatch[0]) ? "gif" : "png";
				return `https://cdn.discordapp.com/emojis/${emojiID}.${emojiExtension}`;
			}

			// The src attribute gets extracted from the resulting <img> tag string
			const parsedEmoji = twemoji.parse(obj, {folder: "svg", ext: ".svg"}),
				i = parsedEmoji.indexOf("https://twemoji.maxcdn.com/v/");

			return i != -1 ? {isEmoji: true, content: parsedEmoji.slice(i, parsedEmoji.indexOf(".svg", i) + 4)} : null;
		}
		case "member": {
			const memberMatch = obj.match(memberRegex), allowRaw = argData.parsedTypeParams.allowRaw;
			let member;

			if (memberMatch) {
				member = await fetchMemberByID(interaction, memberMatch[1], allowRaw);
				return member ? [member] : (allowRaw ? obj : null);
			} else if (argData.parsedTypeParams.mentionOnly) {
				return allowRaw ? obj : null;
			} else {
				const idMatch = obj.match(/^\d{17,19}$/);
				if (idMatch) {
					member = await fetchMemberByID(interaction, idMatch[0], allowRaw);
					if (member) return [member];
				}
			}

			if (!userFetcherFunction) getUserFetcherFunction(bot);

			return await userFetcherFunction(interaction, obj, allowRaw);
		}
		case "slashCommand":
			if (argData.parsedTypeParams.matchType == "whole" || argData.parsedTypeParams.matchType == "partial") {
				const slashCommandParts = lowerObj.split(" ");
				const rawCommand = slashCommandParts[0];

				const slashCommand = bot.slashCommands.get(rawCommand);
				if (!slashCommand) return null;

				const targetType = slashCommand.getType();
				if (targetType == "subcommandGroup") {
					const rawSubcommandGroup = slashCommandParts[1];
					if (argData.parsedTypeParams.matchType == "partial" && !rawSubcommandGroup) return slashCommand;
					const subcommandGroup = slashCommand.subcommandGroups.find(scg => scg.name == rawSubcommandGroup);
					if (!subcommandGroup) return null;

					const rawSubcommand = slashCommandParts[2];
					if (argData.parsedTypeParams.matchType == "partial" && !rawSubcommand) return subcommandGroup;
					const subcommand = subcommandGroup.subcommands.find(sc => sc.name == rawSubcommand);
					if (!subcommand) return null;

					return subcommand;
				} else if (targetType == "subcommand") {
					const rawSubcommand = slashCommandParts[1];
					if (argData.parsedTypeParams.matchType == "partial" && !rawSubcommand) return slashCommand;
					const subcommand = slashCommand.subcommands.find(sc => sc.name == rawSubcommand);
					if (!subcommand) return null;

					return subcommand;
				} else {
					return slashCommand.command;
				}
			} else {
				return bot.slashCommands.get(lowerObj) || null;
			}
		default:
			throw new Error("Invalid argument type to check");
	}
};
