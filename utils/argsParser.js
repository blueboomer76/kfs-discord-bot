const resolver = require("./objResolver.js");

function parseArgQuotes(args, findAll) {
	let beginMatches = args.filter(a => a.match(/^"\S/));
	let endMatches = args.filter(a => a.match(/\S"$/));
	if (beginMatches && endMatches) {
		let beginIndexes = [], endIndexes = [];
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
				if (!findAll) break;
				shift += end - start - 1;
			} else {
				break;
			}
		}
	}
	return args;
}

function checkArgs(bot, message, args, cmdArg) {
	let arg = cmdArg, params;
	if (arg.type == "number") {
		params = {min: arg.min ? arg.min : -Infinity, max: arg.max ? arg.max : Infinity}
	} else if (arg.type == "oneof") {
		params = {list: arg.allowedValues}
	}
	let toResolve = resolver.resolve(bot, message, args, arg.type, params);
	if (toResolve == null) {
		let argErrorMsg = `\`${args.slice(0, 1500)}\` is not a valid ${arg.type}`;
		if (arg.type == "number") {
			argErrorMsg += "\nThe argument must be a number that is "
			if (arg.min && arg.max) {
				argErrorMsg += `in between ${params.min} and ${params.max}`;
			} else if (arg.min) {
				argErrorMsg += `greater than or equal to ${params.min}`;
			} else {
				argErrorMsg += `less than or equal to ${params.max}`;
			}
		} else if (arg.type == "oneof") {
			argErrorMsg = `\nThe argument must be one of these values: ${params.list.join(", ")}`;
		}
		return {error: true, message: argErrorMsg};
	}
	if (arg.type == "channel" || arg.type == "member" || arg.type == "role") {
		if (toResolve.length == 1) {
			return toResolve[0];
		} else {
			let endMsg = "", list = toResolve.slice(0, 20);
			if (toResolve.length > 20) endMsg = `...and ${toResolve.length - 20} more.`;
			if (arg.type == "channel") {
				list = list.map(chnl => chnl.name);
			} else if (arg.type == "member") {
				list = list.map(mem => mem.user.tag);
			} else {
				list = list.map(role => role.name);
			}
			return {
				error: `Multiple ${arg.type}s found`,
				message: `These ${arg.type}s were matched:\n` + "```" + list.join("\n") + "```" + endMsg
			}
		}
	}
	return toResolve;
}

module.exports = {
	parseArgs: (bot, message, args, commandArgs) => {
		if (!commandArgs) return args;
		let parsedArgs = [];
		for (let i = 0; i < commandArgs.length; i++) {
			let arg = commandArgs[i];
			if (arg.num == Infinity) {
				if (arg.allowQuotes) {
					let findAll = false;
					if (arg.parseSeperately) findAll = !findAll;
					let newArgs = parseArgQuotes(args.slice(i), findAll);
					args = args.slice(0, i).concat(newArgs);
					if (arg.parseSeperately) return parsedArgs.concat(newArgs);
				} else {
					args[i] = args.slice(i).join(" ");
				}
			}
			if (!args[i]) {
				if (!arg.optional) {
					let neededType = arg.type == "oneof" ? "value" : arg.type;
					return {error: `Missing argument ${i+1}`, message: `A valid ${neededType} must be provided.`}
				} else {
					parsedArgs.push(null);
					continue;
				}
			}
			let parsedArg = checkArgs(bot, message, args[i], arg);
			if (parsedArg.error) {
				if (parsedArg.error == true) parsedArg.error = `Argument ${i+1} error`;
				return parsedArg;
			}
			args[i] = parsedArg;
			parsedArgs.push(parsedArg);
		}
		return parsedArgs;
	},
	parseFlags: (bot, message, args, commandFlags) => {
		// 1. Get flags
		let flags = [];
		let flagIndexes = [];
		let flagRegex = /^(-[a-z](?![a-z])|(-{2}|—)[a-z]{2})/i;
		let flagBases = args.filter(a => flagRegex.test(a));
		for (let i = 0; i < flagBases.length; i++) {
			flagIndexes.push(args.indexOf(flagBases[i]));
			let flagObj = {method: "short", name: "", args: []};
			if (flagBases[i].match(/^-{2}|—/)) flagObj.method = "long";
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
		let newArgs = args.slice(0, flagIndexes[0]);

		// 2. Parse flags
		let parsedFlags = [];
		let flagShortNames = commandFlags.map(f => f.name.charAt(0));
		let flagLongNames = commandFlags.map(f => f.name);
		for (let i = 0; i < flags.length; i++) {
			const shortIndex = flagShortNames.indexOf(flags[i].name);
			if (shortIndex != -1 && flags[i].method == "short") {
				flags[i].name = flagLongNames[shortIndex];
			}
			let longNameIndex = flagLongNames.indexOf(flags[i].name);
			if (shortIndex == -1 && longNameIndex == -1) {
				if (parsedFlags.length == 0) {
					if (i < flags.length - 1) {
						newArgs = args.slice(0, flagIndexes[i+1]);
						continue;
					} else {
						newArgs = args;
						break;
					}
				} else {
					continue;
				}
			}
			let commandFlag = commandFlags[longNameIndex];
			if (commandFlag.arg) {
				let flagArgToCheck = flags[i].args.join(" ");
				if (flagArgToCheck.length == 0) {
					let neededType = commandFlag.arg.type == "oneof" ? "value" : commandFlag.arg.type;
					return {
						error: `Missing flag argument at flag name ${commandFlag.name}`,
						message: `A valid ${neededType} must be provided.`
					}
				}
				let parsedFlagArg = checkArgs(bot, message, flagArgToCheck, commandFlag.arg);
				if (parsedFlagArg.error) {
					if (parsedFlagArg.error == true) parsedFlagArg.error = `Flag argument error at flag name ${commandFlag.name}`;
					return parsedFlagArg;
				}
				flags[i].args = parsedFlagArg;
			}
			parsedFlags.push(flags[i]);
		}
		return {
			flags: parsedFlags,
			newArgs: newArgs
		};
	}
}
