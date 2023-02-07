const {MessageEmbed} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	util = require("util");

const subcommands = [
	class EvalSubcommand extends Command {
		constructor() {
			super({
				name: "eval",
				description: "Evaluate JavaScript code",
				allowDMs: true,
				args: [
					{
						name: "code",
						description: "Node.js code",
						type: "string",
						required: true
					},
					{
						name: "console",
						description: "Put the result in the console",
						type: "boolean"
					},
					{
						name: "inspect",
						description: "Inspect the result",
						type: "boolean"
					},
					{
						name: "promise",
						description: "Wait for a promise if applicable",
						type: "boolean"
					}
				],
				cooldown: {
					time: 0,
					type: "user"
				},
				hidden: true,
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 5
				}
			});
		}

		async run(ctx) {
			const inputCode = ctx.parsedArgs["code"];
			const consoleFlag = ctx.parsedArgs["console"];
			let isPromise = ctx.parsedArgs["promise"];

			let rawRes, beginEval, endEval;
			try {
				beginEval = process.hrtime();
				rawRes = eval(inputCode);
				if (isPromise && rawRes instanceof Promise) {
					await ctx.interaction.deferReply();
					rawRes = await rawRes.catch(err => this.getErrorString(err, consoleFlag));
				}
			} catch (err) {
				rawRes = this.getErrorString(err, consoleFlag);
				isPromise = false;
			} finally {
				endEval = process.hrtime();
			}

			const ns = (endEval[0] - beginEval[0]) * 1e+9 + (endEval[1] - beginEval[1]);
			let evalTime;
			if (ns < 100000) {
				evalTime = (ns / 1000).toPrecision(3) + "μs";
			} else if (ns < 1e+9) {
				evalTime = (ns / 1000000).toPrecision(3) + "ms";
			} else {
				evalTime = Math.round(ns / 1000000) + "ms";
			}

			const res = typeof rawRes == "function" ? rawRes.toString() : rawRes;
			if (consoleFlag) {
				console.log(res);
				ctx.respond("Done!");
			} else {
				const rawCodeFieldText = inputCode.length > 1000 ? inputCode.slice(0, 1000) + "..." : inputCode,
					evalEmbed = new MessageEmbed()
						.setTitle("discord.js Evaluator")
						.setColor(Math.floor(Math.random() * 16777216))
						.setFooter({text: "Execution took: " + evalTime})
						.setTimestamp(ctx.interaction.createdAt)
						.addField("Input Code", "```javascript" + "\n" + rawCodeFieldText + "```");
				let resToSend = ctx.parsedArgs["inspect"] && typeof rawRes != "function" ? util.inspect(res) : res;

				// Check if the result is longer than the allowed field length
				let isLongResult = false;
				if (resToSend != undefined && resToSend != null) {
					resToSend = resToSend.toString().replace(new RegExp(ctx.bot.token, "g"), "[Bot Token]");
					isLongResult = resToSend.length > 1000;
				}
				if (isLongResult) {
					console.log(res);
					evalEmbed
						.addField(isPromise ? "Promise Result" : "Result",
							"```javascript\n" + resToSend.toString().slice(0, 1000) + "...```")
						.addField("Note", "The full result has been logged in the console.");
				} else {
					evalEmbed.addField(isPromise ? "Promise Result" : "Result", "```javascript\n" + resToSend + "```");
				}

				ctx.respond(evalEmbed);
			}
		}

		getErrorString(err, isConsole) {
			if (err instanceof Error && err.stack && !isConsole) {
				return err.stack.split("    ", 3).join("    ") + "    ...";
			}
			return err;
		}
	},
	class ReloadFileSubcommand extends Command {
		constructor() {
			super({
				name: "reloadfile",
				description: "Reload a file",
				allowDMs: true,
				args: [
					{
						name: "file",
						description: "File to reload",
						type: "string",
						required: true
					}
				],
				cooldown: {
					time: 0,
					type: "user"
				},
				hidden: true,
				perms: {
					bot: [],
					user: [],
					level: 5
				}
			});
		}

		async run(ctx) {
			try {
				const res = delete require.cache[require.resolve("../../" + ctx.parsedArgs["file"])];
				ctx.respond(res ? "The file's require() cache has been cleared." : "Failed to reload that file.");
			} catch (err) {
				ctx.respond("A problem has occurred while reloading the file: `" + err + "`");
			}
		}
	},
	class ShutdownSubcommand extends Command {
		constructor() {
			super({
				name: "shutdown",
				description: "Shut down the bot and its process",
				allowDMs: true,
				cooldown: {
					time: 0,
					type: "user"
				},
				hidden: true,
				perms: {
					bot: [],
					user: [],
					level: 4
				}
			});
		}

		async run(ctx) {
			await ctx.respond("Logging stats and shutting down the bot...");
			process.exit();
		}
	}
];

class OwnerCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "owner",
			description: "Owner/admin commands",
			subcommands: subcommands
		});
	}
}

module.exports = OwnerCommandGroup;
