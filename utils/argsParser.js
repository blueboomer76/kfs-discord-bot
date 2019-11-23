const resolver = require("./objResolver.js");

const listableTypes = ["channel", "emoji", "member", "role"];

function parseArgQuotes(args, findAll) {
	const indexes1 = [], indexes2 = [];
	let matchRegex = /^"\S/;
	const filter = (acc, val, i) => {
		if (matchRegex.test(val)) acc.push(i);
		return acc;
	};
	const matches1 = args.reduce(filter, []);
	matchRegex = /\S"$/;
	const matches2 = args.reduce(filter, []);

	if (matches1.length > 0 && matches2.length > 0) {
		for (let i = 0; i < matches1.length; i++) {
			const i2Index = indexes2.find(ind => ind >= indexes1[i]);
			if (i2Index != undefined) {
				const start = indexes1[i], end = i2Index + 1;
				if (i > 0 && indexes2.find(ind => ind >= indexes1[i-1]) == i2Index) continue;
				const newArg = args.splice(start, end - start).join(" ");
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
	const arg = cmdArg;
	let params;
	switch (arg.type) {
		case "function": params = {testFunction: arg.testFunction}; break;
		case "member": params = {allowRaw: arg.allowRaw}; break;
		case "float":
		case "number": params = {min: arg.min || -Infinity, max: arg.max || Infinity}; break;
		case "oneof": params = {list: arg.allowedValues};
	}

	const resolved = await resolver.resolve(bot, message, args, arg.type, params);
	if (resolved == null) {
		if (cmdArg.shiftable) {
			return {shift: true};
		} else {
			let argErrorMsg = listableTypes.includes(arg.type) ?
				`No ${arg.type}s were found matching \`${args}\`` : `\`${args}\` is not a valid ${arg.type}`;
			if (cmdArg.errorMsg) {
				argErrorMsg = cmdArg.errorMsg;
			} else {
				if (arg.type == "image") {
					argErrorMsg = "A valid mention, image URL, or emoji must be provided";
				} else if (arg.type == "number") {
					argErrorMsg += "\nThe argument must be a number";
					if (arg.min || arg.max) {
						argErrorMsg += " that is ";
						if (arg.min) {
							argErrorMsg += arg.max ? `in between ${params.min} and ${params.max}` :
								"greater than or equal to " + params.min;
						} else {
							argErrorMsg += "less than or equal to " + params.max;
						}
					}
				} else if (arg.type == "oneof") {
					argErrorMsg = "The argument must be one of these values: " + params.list.join(", ");
				}
			}
			return {error: true, message: argErrorMsg};
		}
	}
	if (listableTypes.includes(arg.type) && (!params || !params.allowRaw || Array.isArray(resolved))) {
		if (resolved.length == 1) {
			return resolved[0];
		} else {
			const endMsg = resolved.length > 20 ? `...and ${resolved.length - 20} more.` : "";
			let list = resolved.slice(0,20);
			list = arg.type == "member" ? list.map(mem => `${mem.user.tag} (${mem.user.id})`) :
				list.map(obj => `${obj.name} (${obj.id})`);

			return {
				error: `Multiple ${arg.type}s found`,
				message: `These ${arg.type}s were matched:` + "\n" + "```" + list.join("\n") + "```" + endMsg
			};
		}
	}
	return resolved;
}

module.exports = {
	parseArgs: async (bot, message, args, command) => {
		const subcommands = command.subcommands;
		let commandArgs = command.args;
		if (commandArgs.length == 0 && subcommands.length == 0) return args;

		let subcmd;
		if (subcommands.length > 0) {
			const foundScmd = subcommands.find(scmd => scmd.name == args[0]);
			if (foundScmd) {
				subcmd = foundScmd.name;
				commandArgs = foundScmd.args;
				args.shift();
			} else {
				const fallback = subcommands.find(scmd => scmd.name == "fallback");
				if (fallback) {
					commandArgs = fallback.args;
				} else {
					return {
						error: "Invalid subcommand",
						message: "You must provide one of these subcommands: " +
							subcommands.map(scmd => scmd.name).join(", ")
					};
				}
			}
		}

		const parsedArgs = [];
		for (let i = 0; i < commandArgs.length; i++) {
			const arg = commandArgs[i];
			if (arg.infiniteArgs) {
				if (arg.allowQuotes) {
					const newArgs = parseArgQuotes(args.slice(i), arg.parseSeperately);
					if (arg.parseSeperately) {
						for (let j = 0; j < newArgs.length; j++) {
							const parsedSepArg = await checkArgs(bot, message, newArgs[j], arg);
							if (parsedSepArg.error) {
								if (parsedSepArg.error == true) parsedSepArg.error = `Argument ${i+j+1} error`;
								return parsedSepArg;
							}
							parsedArgs.push(parsedSepArg);
						}
						return parsedArgs;
					} else {
						args = args.slice(0, i).concat(newArgs);
					}
				} else {
					if (arg.parseSeperately) {
						const newArgs = args.slice(i);
						for (let j = 0; j < newArgs.length; j++) {
							const parsedSepArg = await checkArgs(bot, message, newArgs[j], arg);
							if (parsedSepArg.error) {
								if (parsedSepArg.error == true) parsedSepArg.error = `Argument ${i+j+1} error`;
								return parsedSepArg;
							}
							parsedArgs.push(parsedSepArg);
						}
						return parsedArgs;
					} else {
						args[i] = args.slice(i).join(" ");
					}
				}
			}
			if (!args[i]) {
				if (!arg.optional) {
					const neededType = arg.type == "oneof" ? "value" : arg.type;
					return {
						error: `Missing argument ${i+1}`,
						message: arg.missingArgMsg || `A valid ${neededType} must be provided.`
					};
				} else {
					parsedArgs.push(null);
					continue;
				}
			}

			const parsedArg = await checkArgs(bot, message, args[i], arg);
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
		if (subcmd) parsedArgs.unshift(subcmd);

		return parsedArgs;
	},
	parseFlags: async (bot, message, args, commandFlags) => {
		// 1. Get flags
		const flags = [],
			flagBases = args.filter(a => /^(-[a-z](?![a-z])|(-{2}|—)[a-z]{2})/i.test(a)),
			flagIndexes = flagBases.map(base => args.indexOf(base));

		for (let i = 0; i < flagBases.length; i++) {
			const flagData = {
				method: /^-{2}|—/.test(flagBases[i]) ? "long" : "short",
				name: flagBases[i].slice(flagBases[i].startsWith("--") ? 2 : 1),
				args: []
			};
			if (i > 0 && flagIndexes[i] - flagIndexes[i-1] > 1) {
				flags[i-1].args = args.slice(flagIndexes[i-1] + 1, flagIndexes[i]).join(" ").split(",");
			}
			if (i == flagBases.length - 1 && flagIndexes[i] < args.length - 1) {
				flagData.args = args.slice(flagIndexes[i] + 1).join(" ").split(",");
			}
			flags.push(flagData);
		}
		let newArgs = args.slice(0, flagIndexes[0]);

		// 2. Parse flags
		const parsedFlags = [],
			flagShortNames = commandFlags.map(f => f.name.charAt(0)),
			flagLongNames = commandFlags.map(f => f.name.toLowerCase());
		for (let i = 0; i < flags.length; i++) {
			const shortIndex = flagShortNames.indexOf(flags[i].name);
			if (shortIndex != -1 && flags[i].method == "short") {
				flags[i].name = flagLongNames[shortIndex].toLowerCase();
			}
			if (shortIndex == -1 && !flagLongNames.includes(flags[i].name)) {
				if (parsedFlags.length == 0) {
					if (i < flags.length - 1) {
						newArgs = args.slice(0, flagIndexes[i+1]);
					} else {
						newArgs = args;
						break;
					}
				} else {
					continue;
				}
			}
			const commandFlag = commandFlags[flagLongNames.indexOf(flags[i].name)];
			if (commandFlag.arg) {
				if (!flags[i].args[0]) {
					if (!commandFlag.arg.optional) {
						const neededType = commandFlag.arg.type == "oneof" ? "value" : commandFlag.arg.type;
						return {
							error: "Missing flag argument at flag name " + commandFlag.name,
							message: commandFlag.arg.errorMsg || `A valid ${neededType} must be provided.`
						};
					} else {
						flags[i].args[0] = null;
						parsedFlags.push(flags[i]);
						continue;
					}
				}
				for (let j = 0; j < flags[i].args.length; j++) {
					const parsedFlagArg = await checkArgs(bot, message, flags[i].args[j], commandFlag.arg);
					if (parsedFlagArg.error) {
						if (parsedFlagArg.error == true) {
							parsedFlagArg.error = "Flag argument error at flag name " + commandFlag.name;
						}
						return parsedFlagArg;
					}
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
};