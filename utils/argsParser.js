const resolver = require("./objResolver.js");

function parseArgQuotes(args) {
	let beginMatches = args.filter(a => a.match(/^"\S/));
	let endMatches = args.filter(a => a.match(/\S"$/));
	if (beginMatches && endMatches) {
		let beginIndexes = [];
		let endIndexes = [];
		for (let i = 0; i < beginMatches.length; i++) {
			beginIndexes.push(args.indexOf(beginMatches[i]));
		}
		for (let i = 0; i < endMatches.length; i++) {
			endIndexes.push(args.indexOf(endMatches[i]));
		}
		let shift = 0;
		for (let i = 0; i < beginMatches.length; i++) {
			let endIndex = endIndexes.find(j => j >= beginIndexes[i]);
			if (endIndex != undefined) {
				if (i > 0 && endIndexes.find(j => j >= beginIndexes[i-1]) == endIndex) continue;
				let start = beginIndexes[i] - shift;
				let end = endIndex - shift + 1;
				let newArg = args.splice(start, end - start).join(" ");
				args.splice(start, 0, newArg.slice(1, newArg.length - 1));
				shift += end - start - 1;
			} else {
				break;
			}
		}
	}
	return args;
}

module.exports = {
	parseArgs: (bot, message, args, commandArgs) => {
		if (!commandArgs) return args;
		let parsedArgs = [];
		for (let i = 0; i < commandArgs.length; i++) {
			let arg = commandArgs[i];
			if (arg.num == Infinity) {
				if (arg.allowQuotes) {
					args[i] = parseArgQuotes(args)[i];
				} else {
					args[i] = args.slice(i).join(" ");
				}
			}
			if (!args[i]) {
				if (!arg.optional) {
					return {error: "userError", message: "Missing argument", at: i}
				} else {
					parsedArgs.push(null);
					continue;
				}
			}
			let toResolve;
			if (arg.type != "number") {
				toResolve = resolver.resolve(bot, message, args[i], arg.type)
			} else {
				let numObj = {
					test: args[i],
					min: -Infinity,
					max: Infinity
				};
				if (arg.min) numObj.min = arg.min;
				if (arg.max) numObj.max = arg.max;
				toResolve = resolver.resolve(bot, message, numObj, arg.type)
			}
			if (toResolve == null) {
				return {error: "userError", message: "Invalid argument `(Must be a valid " + arg.type + ")`", at: i}
			}
			parsedArgs.push(toResolve);
		}
		return parsedArgs;
	},
	getFlags: args => {
		let newArgs;
		let flags = [];
		let flagIndexes = [];
		let flagRegex = /^(-[a-z]$|(--|—)[a-z][a-z])/i;
		let flagBases = args.filter(a => flagRegex.test(a));
		for (let i = 0; i < flagBases.length; i++) {
			flagIndexes.push(args.indexOf(flagBases[i]));
			let flagObj = {method: "", name: "", args: []};
			if (flagBases[i].match(/^-{2}|—/)) {
				flagObj.method = "long";
			} else {
				flagObj.method = "short";
			}
			if (flagBases[i].startsWith("--")) {
				flagObj.name = flagBases[i].slice(2);
			} else {
				flagObj.name = flagBases[i].slice(1);
			}
			if (i > 0 && flagIndexes[i] - flagIndexes[i-1] > 1) {
				flags[i-1].args = args.slice(flagIndexes[i-1] + 1, flagIndexes[i]);
			}
			if (i == flagBases.length - 1 && flagIndexes[i] < args.length - 1) {
				flagObj.args = args.slice(flagIndexes[i] + 1);
			}
			flags.push(flagObj);
		}
		newArgs = args.slice(0, flagIndexes[0]);
		return {
			flags: flags,
			newArgs: newArgs
		};
	},
	parseFlags: (bot, message, flags, commandFlags) => {
		let flagShortNames = commandFlags.map(f => f.name.charAt(0));
		let flagLongNames = commandFlags.map(f => f.name);
		for (let i = 0; i < flags.length; i++) {
			const shortIndex = flagShortNames.indexOf(flags[i].name);
			if (shortIndex != -1 && flags[i].method == "short") {
				flags[i].name = flagLongNames[shortIndex];
			}
			let longNameIndex = flagLongNames.indexOf(flags[i].name);
			if (shortIndex == -1 && longNameIndex == -1) {
				return {error: "userError", message: "A nonexistant flag was provided", at: i}
			}
			let toResolve = flags[i].args;
			if (commandFlags[longNameIndex].argsType) {
				toResolve = resolver.resolve(bot, message, flags[i].args.join(" "), commandFlags[longNameIndex].argsType);
				if (toResolve == null) {
					return {error: "userError", message: "Invalid argument in a flag", at: i};
				}
				flags[i].args = toResolve;
			}
		}
		return flags;
	}
}
