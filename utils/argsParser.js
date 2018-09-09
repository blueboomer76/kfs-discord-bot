const Discord = require("discord.js");
const resolver = require("./objResolver.js");

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
					if (arg.parseSeperately) {
						return parsedArgs.concat(newArgs)
					};
				} else {
					args[i] = args.slice(i).join(" ");
				}
			}
			if (!args[i]) {
				if (!arg.optional) {
					return {error: "userError", message: arg.errorMsg || `Missing argument ${i}`}
				} else {
					parsedArgs.push(null);
					continue;
				}
			};
			let toResolve, params;
			if (arg.type == "number") {
				params = {min: arg.min ? arg.min : -Infinity, max: arg.max ? arg.max : Infinity}
			} else if (arg.type == "oneof") {
				params = {list: arg.allowedValues}
			}
			toResolve = resolver.resolve(bot, message, args[i], arg.type, params)
			if (!toResolve) {
				return {error: "userError", message: `\`${args[i]}\` is not a valid ${arg.type}`}
			}
			parsedArgs.push(toResolve);
		}
		return parsedArgs;
	},
	parseFlags: (bot, message, args, commandFlags) => {
		// 1. Get flags
		let flags = [];
		let flagIndexes = [];
		let flagRegex = /^(-{1,2}|—)[a-z]/;
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
				flags[i-1].args = args.slice(flagIndexes[i-1] + 1, flagIndexes[i]).join(" ").split(",")
			} else if (i == flagBases.length - 1 && flagIndexes[i] < args.length - 1) {
				flagObj.args = args.slice(flagIndexes[i] + 1).join(" ").split(",")
			}
			flags.push(flagObj);
		}
		let newArgs = args.slice(0, flagIndexes[0]);
		let flagArgs = args.slice(flagIndexes[0]);
		
		// 2. Parse flags
		let parsedFlags = [];
		let flagShortNames = commandFlags.map(f => f.name.charAt(0));
		let flagLongNames = commandFlags.map(f => f.name);
		for (let i = 0; i < flags.length; i++) {
			if (flags[i].method == "short") {
				flags[i].name = flagLongNames[flagShortNames.indexOf(flags[i].name)]
			}
			if (!flagLongNames.includes(flags[i].name)) {
				if (parsedFlags.length == 0 && i < flags.length - 1) {
					newArgs = args.slice(0, flagIndexes[i+1]);
					flagArgs = args.slice(flagIndexes[i+1]);
				} else {
					continue;
				}
			}
			let commandFlag = commandFlags[flagLongNames.indexOf(flags[i].name)];
			if (commandFlag.arg) {
				for (let j = 0; j < flags[i].args.length; j++) {
					let flagArg = commandFlag.arg;
					let params;
					if (flagArg.type == "number") {
						params = {min: flagArg.min ? flagArg.min : -Infinity, max: flagArg.max ? flagArg.max : Infinity}
					} else if (flagArg.type == "oneof") {
						params = {list: flagArg.allowedValues}
					}
					let toResolve = resolver.resolve(bot, message, flags[i].args[j], commandFlag.arg.type, params);
					if (!toResolve) {
						return {error: "userError", message: `\`${flags[i].args[j]}\` is not a valid ${arg.type}`, at: i}
					}
					flags[i].args[j] = toResolve;
				}
				
			}
			parsedFlags.push(flags[i]);
		}
		return {
			flags: parsedFlags,
			newArgs: newArgs
		};
	}
}

function parseArgQuotes(args, findAll) {
	let matches1 = args.filter(a => a.match(/^"[^ ]/));
	let matches2 = args.filter(a => a.match(/[^ ]"$/));
	if (matches1 && matches2) {
		let indexes1 = [], indexes2 = [];
		for (let i = 0; i < matches1.length; i++) {
			indexes1.push(args.indexOf(matches1[i]));
		}
		for (let i = 0; i < matches2.length; i++) {
			indexes2.push(args.indexOf(matches2[i]));
		}
		for (let i = 0; i < matches1.length; i++) {
			let i2Index = indexes2.find(ind => ind >= indexes1[i])
			if (i2Index != undefined) {
				let start = indexes1[i];
				let end = i2Index + 1;
				if (i > 0 && indexes2.find(ind => ind >= indexes1[i-1]) == i2Index) continue;
				let newArg = args.splice(start, end - start).join(" ");
				args.splice(start, 0, newArg.slice(1, newArg.length - 1));
				if (!findAll) break;
			} else {
				break;
			}
		}
	}
	return args;
}