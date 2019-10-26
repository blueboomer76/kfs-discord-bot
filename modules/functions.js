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

function capitalize(str, capAll = false) {
	str = str.toString();
	if (capAll) {
		return str.split(/[ _-]/).map(str2 => str2.charAt(0).toUpperCase() + str2.slice(1).toLowerCase()).join(" ");
	} else {
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	}
}

module.exports = {
	capitalize: capitalize,
	getBotStats: bot => {
		const cachedStats = bot.cache.stats,
			cumulativeStats = bot.cache.cumulativeStats;
		let commandCurrentTotal = cachedStats.commandCurrentTotal;
		for (const cmdName in cachedStats.commandUsages) {
			commandCurrentTotal += cachedStats.commandUsages[cmdName];
		}
		const presences = {online: 0, idle: 0, dnd: 0, offline: 0},
			channels = {text: 0, voice: 0, category: 0, dm: 0};
		for (const user of bot.users.values()) presences[user.presence.status]++;
		for (const channel of bot.channels.values()) channels[channel.type]++;

		return {
			servers: bot.guilds.size,
			largeServers: bot.guilds.filter(g => g.large).size,
			users: bot.users.size,
			presences: presences,
			channels: {
				text: channels.text,
				voice: channels.voice,
				categories: channels.category
			},
			sessionCommands: cachedStats.commandSessionTotal + commandCurrentTotal,
			totalCommands: cumulativeStats.commandTotal + commandCurrentTotal,
			sessionCalls: cachedStats.callSessionTotal + cachedStats.callCurrentTotal,
			totalCalls: cumulativeStats.callTotal + cachedStats.callCurrentTotal,
			sessionMessages: cachedStats.messageSessionTotal + cachedStats.messageCurrentTotal,
			totalMessages: cumulativeStats.messageTotal + cachedStats.messageCurrentTotal
		};
	},
	getDuration: (time1, time2, simple = false) => {
		if (time1 == undefined || isNaN(time1)) throw new TypeError("Time 1 requires a timestamp in milliseconds");
		if (time2 != undefined) {
			if (isNaN(time2)) throw new TypeError("Time 2 requires a timestamp in milliseconds");
		} else {
			time2 = Date.now();
		}

		const secDif = Math.abs((time2 - time1) / 1000);
		let baseStr1 = "", baseStr2 = "";
		if (secDif < 60) {
			baseStr1 = secDif.toFixed(simple ? 0 : 1) + " seconds";
		} else if (secDif < 3.1536e+9) {
			if (secDif < 3600) {
				baseStr1 = Math.floor(secDif / 60) + " minute";
				baseStr2 = Math.floor(secDif % 60) + " second";
			} else if (secDif < 86400) {
				baseStr1 = Math.floor(secDif / 3600) + " hour";
				baseStr2 = Math.floor((secDif % 3600) / 60) + " minute";
			} else if (secDif < 2678400) {
				baseStr1 = Math.floor(secDif / 86400) + " day";
				baseStr2 = Math.floor((secDif % 86400) / 3600) + " hour";
			} else {
				const date1 = new Date(time1),
					date2 = time2 ? new Date(time2) : new Date();
				let yrDif = date2.getFullYear() - date1.getFullYear(),
					moDif = date2.getMonth() - date1.getMonth(),
					dayDif = date2.getDate() - date1.getDate();
				if ((moDif == 0 && dayDif < 0) || moDif < 0) {yrDif--; moDif += 12}
				if (dayDif < 0) {moDif--; dayDif += 30}
				if (yrDif == 0) {
					baseStr1 = moDif + " month";
					baseStr2 = dayDif + " day";
				} else {
					if (dayDif >= 20) {
						moDif++;
						if (moDif > 11) {moDif = 0; yrDif++}
					}
					baseStr1 = yrDif + " year";
					baseStr2 = moDif + " month";
				}
			}
			if (!baseStr1.startsWith("1 ")) baseStr1 += "s";
			if (!baseStr2.startsWith("1 ")) baseStr2 += "s";
			if (!simple) {
				baseStr1 += ",";
				baseStr2 += " ";
			}
		} else {
			baseStr1 = Math.round((secDif - 5256000) / 31536000) + " years";
		}

		const suffix = time1 <= time2 ? "ago" : "left"; // Duration flows from time1 to time2
		return simple ? `${baseStr1} ${suffix}` : `${baseStr1} ${baseStr2}${suffix}`;
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
		let parsedNum = typeof num != "number" ? parseFloat(num) : num;
		if (options.maxFullShow) {
			if (options.maxFullShow < 1000 || options.maxFullShow >= 1e+15) {
				throw new RangeError("The maximum number to show in full must be >= 1000 and < 1e+15.");
			}
		} else {
			options.maxFullShow = 1e+9;
		}

		const isNegative = num < 0;
		if (isNegative) parsedNum *= -1;

		const numFactor = Math.abs(parsedNum) / 1000;
		if (numFactor < (options.maxFullShow / 1000)) {
			return (isNegative ? "-" : "") + parsedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		} else if (numFactor >= 1e+300) {
			return (isNegative ? "-" : "") + parsedNum.toString();
		}

		// Build the string to be returned
		const expon = Math.log10(numFactor),
			tens = Math.floor(expon / 30),
			ones = Math.floor(expon % 30 / 3),
			dispNum = numFactor / (Math.pow(1e+30, tens) * Math.pow(1000, ones));

		let numString;
		if (options.precision) {
			numString = dispNum.toPrecision(options.precision);
		} else if (options.fixed) {
			numString = dispNum.toFixed(options.fixed);
		} else {
			numString = dispNum.toPrecision(6);
		}

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
		return (isNegative ? "-" : "") + parseFloat(numString).toString() + (options.noSpace ? "" : " ") + suffix;
	},
	parseLargeNumberInput: str => {
		const trimmed = str.trim();
		if (/^\d+(\.\d+)?(e\+\d+)?$/.test(trimmed)) return parseFloat(trimmed);

		const baseMatch = str.match(/^\d+(\.\d+)?/), suffixMatch = str.match(/(?!^)[a-z]+/i);
		if (!baseMatch || !suffixMatch) return NaN;

		const foundSuffix = suffixMatch[0].toLowerCase().replace(/illion$/, ""),
			foundSpecialSuffix = specialNumberKeys.find(key => key.short == foundSuffix || key.long == foundSuffix);
		let parsedNum = parseFloat(baseMatch[0]);
		if (foundSpecialSuffix) return parsedNum * foundSpecialSuffix.value;

		let matchLength = 0, long;
		const foundTensSuffix = tensNumberKeys.find(key => {
			if (foundSuffix.endsWith(key.long)) {matchLength = key.long.length; long = true; return true}
			if (foundSuffix.endsWith(key.short)) {matchLength = key.short.length; long = false; return true}
			return false;
		});

		let foundSuffix2 = foundSuffix;
		if (foundTensSuffix) {
			parsedNum *= foundTensSuffix.value;
			if (matchLength == foundSuffix.length) return parsedNum;

			foundSuffix2 = foundSuffix2.slice(0, foundSuffix.length - matchLength);
			if (long) {
				if (foundSuffix2 == "tres" && foundTensSuffix.long == "vigint") return parsedNum * 1e+9;
				if (foundSuffix2 == "septen" && foundTensSuffix.value <= 1e+93) return parsedNum * 1e+21;
			}
		}
		let filter;
		if (long) {filter = key => key.long == foundSuffix2} else {filter = key => key.short == foundSuffix2}
		const foundOnesSuffix = onesNumberKeys.find(filter);
		return foundOnesSuffix ? parsedNum * foundOnesSuffix.value : NaN;
	},
	parsePerm: perm => {
		return perm.split("_").map(p => capitalize(p.toLowerCase())).join(" ");
	}
};
