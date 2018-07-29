const Discord = require("discord.js");
const resolver = require("./objResolver.js");

module.exports = {
	parseArgs: (bot, message, args, commandArgs) => {
		let parsedArgs = [];
		for (let i = 0; i < commandArgs.length; i++) {
			let arg = commandArgs[i];
			if (arg.allowQuotes) args[i] = parseArgQuotes(args)[i];
			if (!args[i]) {
				if (!arg.optional) {
					return {error: "userError", message: "Missing argument", at: i}
				} else {
					parsedArgs.push(null);
					continue;
				}
			};
			let toResolve;
			if (arg.type != "number") {
				toResolve = resolver.resolve(bot, message, args[i], arg.type)
			} else {
				let numObj = {
					test: args[i],
					min: arg.min
				}
				if (arg.max) numObj.max = arg.max;
				toResolve = resolver.resolve(bot, message, numObj, arg.type)
			}
			if (!toResolve) {
				return {error: "userError", message: "Invalid argument `(Must be a(n) " + arg.type + ")`", at: i}
			}
			parsedArgs.push(toResolve);
		}
		return parsedArgs;
	},
	getFlags: args => {
		let newArgs;
		let flags = [];
		let flagIndexes = [];
		let flagRegex = /^-{1,2}|—/;
		let flagBases = args.filter(a => flagRegex.test(a));
		for (let i = 0; i < flagBases.length; i++) {
			flagIndexes.push(args.indexOf(flagBases[i]));
			let flagObj = {method: "", name: "", args: ""};
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
			if (i > 0) {
				if (flagIndexes[i] - flagIndexes[i-1] > 1) {
					flags[i-1].args = args.slice(flagIndexes[i-1] + 1, flagIndexes[i]).join(" ")
				}
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
		let parsedFlags = [];
		let flagShortNames = commandFlags.map(f => f.name.charAt(0));
		let flagLongNames = commandFlags.map(f => f.name);
		for (let i = 0; i < flags.length; i++) {
			if (flags[i].method = "short") {
				flags[i].name = flagLongNames[flagShortNames.indexOf(flags[i])]
			}
			if (flagLongNames.indexOf(flags[i].name) == -1) {
				return {error: "userError", message: "A nonexistant flag was provided", at: i}
			}
			if (commandFlags[flagLongNames.indexOf(flags[i].name)].argsType) {
				let toResolve = resolveObject(bot, message, flags[i].args, commandFlags[i].argsType);
				if (!toResolve) {
					return {error: "userError", message: "Invalid argument(s) in a flag", at: i}
				}
			}
			parsedFlags.push(toResolve);
		}
		return parsedFlags;
	}
}

function parseArgQuotes(args) {
	let matches1 = args.filter(a => a.match(/"[^ ]+/g));
	let matches2 = args.filter(a => a.match(/[^ ]+"/g));
	let singleArgs = [];
	if (matches1 && matches2) {
		let indexes1 = [];
		let indexes2 = [];
		for (let i = 0; i < matches1.length; i++) {
			indexes1.push(args.indexOf(matches1[i]));
		}
		for (let i = 0; i < matches2.length; i++) {
			indexes2.push(args.indexOf(matches2[i]));
		}
		for (let i = 0; i < indexes1.length; i++) {
			let i2Index = indexes2.find(ind => ind >= indexes1[i])
			if (singleArgs[0]) {
				if (singleArgs[singleArgs.length - 1].end == i2Index + 1) continue;
			}
			if (i2Index != undefined) {
				singleArgs.push({
					start: indexes1[i],
					end: i2Index + 1
				})
			}
		}
		let joined = 0;
		singleArgs.forEach(s => {
			let argsToJoin = args.splice(s.start - joined, s.end - s.start);
			args.splice(s.start - joined, 0, argsToJoin.join(" "));
			joined += s.end - s.start;
		})
	}
	return args;
}