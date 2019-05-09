const onesNumberKeys = [
	{short: "u", long: "un", value: 1000},
	{short: "b", long: "duo", value: 1000000},
	{short: "t", long: "tre", value: 1e+9},
	{short: "qa", long: "quattor", value: 1e+12},
	{short: "qi", long: "quin", value: 1e+15},
	{short: "sx", long: "sex", value: 1e+18},
	{short: "sp", long: "sept", value: 1e+21},
	{short: "o", long: "octo", value: 1e+24},
	{short: "n", long: "novem", value: 1e+27}
];
const tensNumberKeys = [
	{short: "d", long: "dec", value: 1e+33},
	{short: "vg", long: "vigint", value: 1e+63},
	{short: "tg", long: "trigint", value: 1e+93},
	{short: "qag", long: "quadragint", value: 1e+123},
	{short: "qig", long: "quinquagint", value: 1e+153},
	{short: "sxg", long: "sexagint", value: 1e+183},
	{short: "spg", long: "septaugint", value: 1e+213},
	{short: "og", long: "octogint", value: 1e+243},
	{short: "ng", long: "nonagint", value: 1e+273}
];
const specialNumberKeys = [
	{short: "k", long: "thousand", value: 1000},
	{short: "m", long: "million", value: 1000000},
	{short: "b", long: "billion", value: 1e+9},
	{short: "t", long: "trillion", value: 1e+12},
	{short: "qa", long: "quadrillion", value: 1e+15},
	{short: "qi", long: "quintillion", value: 1e+18},
	{short: "sx", long: "sextillion", value: 1e+21},
	{short: "sp", long: "septillion", value: 1e+24},
	{short: "o", long: "octillion", value: 1e+27},
	{short: "n", long: "nonillion", value: 1e+30}
];

function capitalize(str, capAll) {
	str = str.toString();
	if (capAll) {
		return str.split(/[ _-]/).map(str2 => str2.charAt(0).toUpperCase() + str2.slice(1).toLowerCase()).join(" ");
	} else {
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	}
}

module.exports = {
	capitalize: capitalize,
	getBotStats: (bot, stats) => {
		let commandCurrentTotal = bot.cache.stats.commandCurrentTotal;
		for (const usageCacheEntry of bot.cache.stats.commandUsages) {
			commandCurrentTotal += usageCacheEntry.uses;
		}
		return {
			servers: bot.guilds.size,
			largeServers: bot.guilds.filter(g => g.large).size,
			users: bot.users.size,
			onlineUsers: bot.users.filter(u => u.presence.status != "offline").size,
			channels: {
				text: bot.channels.filter(ch => ch.type == "text").size,
				voice: bot.channels.filter(ch => ch.type == "voice").size,
				categories: bot.channels.filter(ch => ch.type == "category").size
			},
			sessionCommands: bot.cache.stats.commandSessionTotal + commandCurrentTotal,
			totalCommands: stats.commandTotal + commandCurrentTotal,
			sessionCalls: bot.cache.stats.callSessionTotal + bot.cache.stats.callCurrentTotal,
			totalCalls: stats.callTotal + bot.cache.stats.callCurrentTotal,
			sessionMessages: bot.cache.stats.messageSessionTotal + bot.cache.stats.messageCurrentTotal,
			totalMessages: stats.messageTotal + bot.cache.stats.messageCurrentTotal
		};
	},
	getDuration: (time1, time2, simple) => {
		if (time1 == undefined) throw new Error("Time 1 is required");
		if (isNaN(time1)) throw new TypeError("Time 1 is not a valid timestamp");
		if (time2 != undefined && isNaN(time2)) throw new TypeError("Time 2 is not a valid timestamp");

		const date1 = new Date(time1),
			date2 = time2 ? new Date(time2) : new Date();
		const ts1 = Number(date1), ts2 = Number(date2);

		const timeDif = Math.abs((ts2 - ts1) / 1000),
			suffix = ts1 <= ts2 ? "ago" : "left";

		let baseStr1 = "", baseStr2 = "";
		if (timeDif < 60) {
			baseStr1 = `${timeDif.toFixed(simple ? 0 : 1)} seconds`;
		} else if (timeDif < 3.1536e+9) {
			if (timeDif < 3600) {
				baseStr1 = `${Math.floor(timeDif / 60)} minute`;
				baseStr2 = `${Math.floor(timeDif % 60)} second`;
			} else if (timeDif < 86400) {
				baseStr1 = `${Math.floor(timeDif / 3600)} hour`;
				baseStr2 = `${Math.floor((timeDif % 3600) / 60)} minute`;
			} else if (timeDif < 2678400) {
				baseStr1 = `${Math.floor(timeDif / 86400)} day`;
				baseStr2 = `${Math.floor((timeDif % 86400) / 3600)} hour`;
			} else {
				let yrDif = date2.getFullYear() - date1.getFullYear(),
					moDif = date2.getMonth() - date1.getMonth(),
					dayDif = date2.getDate() - date1.getDate();
				if ((moDif == 0 && dayDif < 0) || moDif < 0) {yrDif--; moDif += 12}
				if (dayDif < 0) {moDif--; dayDif += 30}
				if (yrDif == 0) {
					baseStr1 = `${moDif} month`;
					baseStr2 = `${dayDif} day`;
				} else {
					if (dayDif >= 20) {
						moDif++;
						if (moDif > 11) {moDif = 0; yrDif++}
					}
					baseStr1 = `${yrDif} year`;
					baseStr2 = `${moDif} month`;
				}
			}
			if (!baseStr1.startsWith("1 ")) baseStr1 += "s";
			if (!baseStr2.startsWith("1 ")) baseStr2 += "s";
			if (!simple) {
				baseStr1 += ",";
				baseStr2 += " ";
			}
		} else {
			baseStr1 = `${Math.round((timeDif - 5256000) / 31536000)} years`;
		}
		
		if (simple) {
			return `${baseStr1} ${suffix}`;
		} else {
			return `${baseStr1} ${baseStr2}${suffix}`;
		}
	},
	parseLargeNumber: (num, options = {}) => {
		/*
			Parser options:
			- capSuffix
			- fixed
			- maxFullShow
			- noSpace
			- precision
			- shortSuffix
		*/
		num = parseFloat(num);
		if (options.maxFullShow) {
			if (options.maxFullShow < 1000) throw new RangeError("The max number to show in full must be at least 1000.");
		} else {
			options.maxFullShow = 1e+9;
		}
		const numSign = num < 0 ? "-" : "";
		let num2 = Math.abs(num) / 1000;
		if (num2 < (options.maxFullShow / 1000)) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		if (num2 > 1e+300) return num;

		const expon = Math.log10(num2), tens = Math.floor(expon / 30), ones = Math.floor(expon % 30 / 3);
		num2 /= Math.pow(1e+30, tens) * Math.pow(1000, ones);
		let suffix = "";
		if (options.shortSuffix) {
			if (tens == 0) {
				suffix = specialNumberKeys[num < 1000000 ? 0 : ones].short;
			} else {
				if (ones > 0) suffix = onesNumberKeys[ones - 1].short;
				suffix += tensNumberKeys[tens - 1].short;
			}
			suffix = capitalize(suffix);
		} else {
			if (tens == 0) {
				suffix = specialNumberKeys[num < 1000000 ? 0 : ones].long;
			} else {
				if (tens == 2 && ones == 3) {
					suffix = "tres";
				} else if (tens < 4 && ones == 7) {
					suffix = "septen";
				} else if (ones > 0) {
					suffix = onesNumberKeys[ones - 1].long;
				}
				suffix += tensNumberKeys[tens - 1].long + "illion";
			}
			if (options.capSuffix) suffix = capitalize(suffix);
		}
		let numString = num2;
		if (options.precision) {
			numString = numString.toPrecision(options.precision);
		} else if (options.fixed) {
			numString = numString.toFixed(options.fixed);
		} else {
			numString = numString.toPrecision(6);
		}
		return numSign + parseFloat(numString) + (options.noSpace ? "" : " ") + suffix;
	},
	parseLargeNumberInput: str => {
		str = str.trim();
		if (/^\d+(\.\d+)?(e\+\d+)?$/.test(str)) return parseFloat(str);

		const baseMatch = str.match(/^\d+(\.\d+)?/);
		let suffixMatch = str.match(/(?!^)[a-z]+/i);
		if (!baseMatch || !suffixMatch) return NaN;
		suffixMatch = suffixMatch[0].toLowerCase();
		if (suffixMatch.endsWith("illion")) suffixMatch = suffixMatch.slice(0, suffixMatch.length - 6);

		let parsedNum = parseFloat(baseMatch[0]);
		const foundSpecialSuffix = specialNumberKeys.find(key => key.short == suffixMatch || key.long == suffixMatch);
		if (foundSpecialSuffix) return parsedNum * foundSpecialSuffix.value;

		let suffix2 = suffixMatch, matchLength;
		const foundTensSuffix = tensNumberKeys.find(key => {
			if (suffixMatch.endsWith(key.short)) {matchLength = key.short.length; return true}
			if (suffixMatch.endsWith(key.long)) {matchLength = key.long.length; return true}
			return false;
		});
		
		if (foundTensSuffix) {
			parsedNum *= foundTensSuffix.value;
			if (matchLength == suffixMatch.length) return parsedNum;
			suffix2 = suffix2.slice(0, suffixMatch.length - matchLength);
			if (suffixMatch.length > 5) {
				if (suffix2 == "tres" && foundTensSuffix.long == "vigint") return parsedNum * 1e+72;
				if (suffix2 == "septen" && foundTensSuffix.value <= 1e+93) return parsedNum * foundTensSuffix.value * 1e+21;
			}
		}
		const foundOnesSuffix = onesNumberKeys.find(key => key.short == suffix2 || key.long == suffix2);
		return foundOnesSuffix ? parsedNum * foundOnesSuffix.value : NaN;
	},
	parsePerm: perm => {
		return perm.split("_").map(p => capitalize(p.toLowerCase())).join(" ");
	}
};
