const resolver = require("./objResolver.js");

const listableTypes = ["channel", "emoji", "member", "role"];

function parseArgQuotes(args, findAll) {
	const matches1 = args.filter(a => a.match(/^"\S/)), matches2 = args.filter(a => a.match(/\S"$/));
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
				let start = indexes1[i], end = i2Index + 1;
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

async function checkArgs(bot, message, args, cmdArg) {
	let arg = cmdArg, params;
	if (arg.type == "function") {
		params = {testFunction: arg.testFunction}
	} else if (arg.type == "number") {
		params = {min: arg.min ? arg.min : -Infinity, max: arg.max ? arg.max : Infinity}
	} else if (arg.type == "oneof") {
		params = {list: arg.allowedValues}
	}
	
	let toResolve = await resolver.resolve(bot, message, args, arg.type, params);
	if (!toResolve) {
		if (cmdArg.shiftable) {
			return {shift: true}
		} else {
			let argErrorMsg = listableTypes.includes(arg.type) ? `No ${arg.type}s were found matching \`${args}\`` : `\`${args}\` is not a valid ${arg.type}`
			if (cmdArg.errorMsg) {
				argErrorMsg = cmdArg.errorMsg;
			} else {
				if (arg.type == "image") {
					argErrorMsg = "A valid mention or image URL must be provided"
				} else if (arg.type == "number" && (arg.min || arg.max)) {
					argErrorMsg += "\n" + "The argument must be a number that is "
					if (arg.min && arg.max) {
						argErrorMsg += `in between ${params.min} and ${params.max}`
					} else if (arg.min) {
						argErrorMsg += `greater than or equal to ${params.min}`
					} else {
						argErrorMsg += `less than or equal to ${params.min}`
					}
				} else if (arg.type == "oneof") {
					argErrorMsg = `The argument must be one of these values: ${params.list.join(", ")}`
				}
			}
			return {error: true, message: argErrorMsg};
		}
	}
	if (listableTypes.includes(arg.type)) {
		if (toResolve.length == 1) {
			return toResolve[0];
		} else {
			let endMsg = "", list = toResolve.slice(0,20);
			if (toResolve.length > 20) endMsg = `...and ${toResolve.length - 20} more.`
			if (arg.type == "channel") {
				list = list.map(chnl => `${chnl.name} (${chnl.id})`);
			} else if (arg.type == "emoji") {
				list = list.map(emoji => `${emoji.name} (${emoji.id})`);
			} else if (arg.type == "member") {
				list = list.map(mem => `${mem.user.tag} (${mem.user.id})`);
			} else {
				list = list.map(role => `${role.name} (${role.id})`);
			}
			return {
				error: `Multiple ${arg.type}s found`,
				message: `These ${arg.type}s were matched:\n\`\`\`${list.join("\n")}\`\`\`${endMsg}`
			}
		}
	}
	return toResolve;
}

module.exports = {
	parseArgs: async (bot, message, args, command) => {
		let commandArgs = command.args;
		if (!commandArgs) return args;

		const subcommands = command.subcommands;
		let subcmd;
		if (subcommands.length > 0) {
			const foundScmd = subcommands.find(scmd => scmd.name == args[0]);
			if (foundScmd) {
				subcmd = foundScmd.name;
				commandArgs = foundScmd.args;
				args.shift();
			} else {
				const fallback = subcommands.find(scmd => scmd.name == "fallback")
				if (fallback) {
					commandArgs = fallback.args;
				} else {
					return {
						error: "Invalid subcommand",
						message: `You must provide one of these subcommands: ${subcommands.map(scmd => scmd.name).join(", ")}`
					};
				}
			}
		}

		let parsedArgs = [];
		for (let i = 0; i < commandArgs.length; i++) {
			let arg = commandArgs[i];
			if (arg.infiniteArgs) {
				if (arg.allowQuotes) {
					let findAll = arg.parseSeperately ? true : false, newArgs = parseArgQuotes(args.slice(i), findAll);
					args = args.slice(0, i).concat(newArgs);
					if (arg.parseSeperately) return parsedArgs.concat(newArgs);
				} else {
					args[i] = args.slice(i).join(" ");
				}
			}
			if (!args[i]) {
				if (!arg.optional) {
					let neededType = arg.type == "oneof" ? "value" : arg.type;
					return {
						error: `Missing argument ${i+1}`,
						message: arg.missingArgMsg ? arg.missingArgMsg : `A valid ${neededType} must be provided.`
					}
				} else {
					parsedArgs.push(null);
					continue;
				}
			};

			let parsedArg = await checkArgs(bot, message, args[i], arg);
			if (parsedArg.error) {
				if (parsedArg.error == true) parsedArg.error = `Argument ${i+1} error`;
				return parsedArg;
			} else if (parsedArg.shift) {
				args.splice(i, 0, null);
				parsedArgs.push(null);
				continue;
			}
			args[i] = parsedArg;
			parsedArgs.push(parsedArg);
		}
		if (subcmd) parsedArgs.unshift(subcmd)

		return parsedArgs;
	},
	parseFlags: async (bot, message, args, commandFlags) => {
		// 1. Get flags
		let flags = [],
			flagIndexes = [],
			flagRegex = /^(-{1,2}|—)[a-z]/,
			flagBases = args.filter(a => flagRegex.test(a));
			
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
			}
			if (i == flagBases.length - 1 && flagIndexes[i] < args.length - 1) {
				flagObj.args = args.slice(flagIndexes[i] + 1).join(" ").split(",")
			}
			flags.push(flagObj);
		}
		let newArgs = args.slice(0, flagIndexes[0]), flagArgs = args.slice(flagIndexes[0]);
		
		// 2. Parse flags
		let parsedFlags = [];
		let flagShortNames = commandFlags.map(f => f.name.charAt(0));
		let flagLongNames = commandFlags.map(f => f.name);
		for (let i = 0; i < flags.length; i++) {
			if (flags[i].method == "short") {
				flags[i].name = flagLongNames[flagShortNames.indexOf(flags[i].name)]
			}
			if (!flagLongNames.includes(flags[i].name)) {
				if (parsedFlags.length == 0) {
					if (i < flags.length - 1) {
						newArgs = args.slice(0, flagIndexes[i+1]);
						flagArgs = args.slice(flagIndexes[i+1]);
					} else {
						newArgs = args;
						flagArgs = [];
						break;
					}
				} else {
					continue;
				}
			}
			let commandFlag = commandFlags[flagLongNames.indexOf(flags[i].name)];
			if (commandFlag.arg) {
				if (!flags[i].args[0]) {
					let neededType = commandFlag.arg.type == "oneof" ? "value" : commandFlag.arg.type;
					return {
						error: `Missing flag argument at flag name ${commandFlag.name}`,
						message: commandFlag.arg.errMsg ? commandFlag.arg.errMsg : `A valid ${neededType} must be provided.`
					}
				}
				for (let j = 0; j < flags[i].args.length; j++) {
					let parsedFlagArg = await checkArgs(bot, message, flags[i].args[j], commandFlag.arg);
					if (parsedFlagArg.error) {
						if (parsedFlagArg.error == true) parsedFlagArg.error = `Flag argument error at flag name ${commandFlag.name}`;
						return parsedFlagArg;
					};
					flags[i].args[j] = parsedFlagArg;
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