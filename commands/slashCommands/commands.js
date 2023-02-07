const Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	fs = require("fs");

const slashSubcommands = [
	class SlashLoadSubcommand extends Command {
		constructor() {
			super({
				name: "load",
				description: "Load or reload a slash command",
				args: [
					{
						name: "command",
						description: "The command name",
						type: "string",
						required: true
					},
					{
						name: "full",
						description: "Whether to reload the command fully",
						type: "boolean"
					}
				]
			});
		}

		async run(ctx) {
			const commandName = ctx.parsedArgs["command"];
			const commandGroupFile = commandName + ".js",
				foundCmdGroupFile = fs.existsSync("commands/slashCommandsAdvanced/" + commandGroupFile) ?
					"../slashCommandsAdvanced/" + commandGroupFile : "./" + commandGroupFile;

			try {
				delete require.cache[require.resolve(foundCmdGroupFile)];
			} catch (err) {
				return ctx.respond("Command not found in files", {level: "warning"});
			}

			const CommandGroup = require(foundCmdGroupFile);

			ctx.bot.slashCommands.set(commandName, new CommandGroup());

			if (ctx.parsedArgs["full"]) {
				// Also replace the command on Discord
				await ctx.interaction.deferReply();
				ctx.bot.upsertSlashCommand(ctx.parsedArgs["command"])
					.then(() => ctx.respond("Command loaded/reloaded successfully (both locally and on Discord)."))
					.catch(err => ctx.respond("Unable to load/reload command: " + err));
			} else {
				ctx.respond("Command loaded/reloaded successfully.");
			}
		}
	},
	class SlashUnloadSubcommand extends Command {
		constructor() {
			super({
				name: "unload",
				description: "Unload a slash command",
				args: [
					{
						name: "command",
						description: "The command name",
						type: "string",
						parsedType: "slashCommand",
						required: true
					}
				]
			});
		}

		async run(ctx) {
			await ctx.interaction.deferReply();

			ctx.bot.deleteSlashCommand(ctx.parsedArgs["command"])
				.then(() => ctx.respond("Command has been deleted."))
				.catch(err => ctx.respond("Unable to delete command: " + err));
		}
	},
	class SlashInitSubcommand extends Command {
		constructor() {
			super({
				name: "init",
				description: "Replace all this bot's slash commands"
			});
		}

		async run(ctx) {
			await ctx.interaction.deferReply();

			ctx.bot.replaceSlashCommands()
				.then(() => ctx.respond("Commands have been initialized!"))
				.catch(err => ctx.respond("Unable to initialize commands: " + err));
		}
	}
];

const regularSubcommands = [
	class LoadSubcommand extends Command {
		constructor() {
			super({
				name: "load",
				description: "Load a regular command",
				args: [
					{
						name: "category",
						description: "The command category",
						type: "string",
						required: true
					},
					{
						name: "command",
						description: "The command name",
						type: "string",
						required: true
					},
					{
						name: "class_name",
						description: "The command class name in the source code",
						type: "string"
					}
				]
			});
		}

		async run(ctx) {
			const categoryKey = ctx.parsedArgs["category"].toLowerCase().replace(/-/g, " "),
				categoryIndex = ctx.bot.categories.findIndex(data => data.name.toLowerCase() == categoryKey);
			if (categoryIndex == -1) return ctx.respond("Invalid category provided. If the category file was created after the process started, " +
				"the bot needs to be restarted.", {level: "warning"});

			const categoryData = ctx.bot.categories[categoryIndex],
				commandName = ctx.parsedArgs["command"].toLowerCase();
			if (ctx.bot.commands.has(commandName)) return ctx.respond(`A command with the name **${commandName}** is already loaded.`, {level: "error"});

			try {
				const commandFile = categoryData.rawName + ".js",
					foundCmdFile = fs.existsSync("commands/advanced/" + commandFile) ? "../advanced/" + commandFile : "../" + commandFile;
				delete require.cache[require.resolve(foundCmdFile)];

				// Load the classes from the class array from each file
				const commandClasses = require(foundCmdFile),
					commandClassName = ctx.parsedArgs["class_name"],
					key = commandClassName ? commandClassName.toLowerCase() : commandName,
					CommandClass = commandClasses.find(c => c.name.toLowerCase().slice(0, c.name.length - 7) == key);
				if (!CommandClass) return ctx.respond("Command not found in file. If the command class name does not start with the command name, " +
					"provide an argument for the full class name before \"Command\", replacing all numbers in the command with the word.", {level: "warning"});

				const newCommand = new CommandClass();
				newCommand.categoryID = categoryIndex;
				ctx.bot.commands.set(commandName, newCommand);
				if (newCommand.aliases.length > 0) {
					for (const alias of newCommand.aliases) ctx.bot.aliases.set(alias, newCommand.name);
				}
				ctx.respond("The command **" + commandName + "** was loaded.");
			} catch (err) {
				return ctx.respond(`A problem has occurred while trying to load the command **${commandName}**: \`${err}\``, {level: "warning"});
			}
		}
	},
	class ReloadSubcommand extends Command {
		constructor() {
			super({
				name: "reload",
				description: "Reload a regular command",
				args: [
					{
						name: "command",
						description: "The command name",
						type: "string",
						parsedType: "command",
						required: true
					},
					{
						name: "class_name",
						description: "The command class name in the source code",
						type: "string"
					}
				]
			});
		}

		async run(ctx) {
			const command = ctx.parsedArgs["command"],
				commandName = command.name,
				categoryData = ctx.bot.categories[command.categoryID];
			try {
				const commandFile = categoryData.rawName + ".js",
					foundCmdFile = fs.existsSync("commands/advanced/" + commandFile) ? "../advanced/" + commandFile : "../" + commandFile;
				delete require.cache[require.resolve(foundCmdFile)];

				// Load the classes from the class array from each file
				const commandClasses = require(foundCmdFile),
					commandClassName = ctx.parsedArgs["class_name"],
					key = commandClassName ? commandClassName.toLowerCase() : commandName,
					CommandClass = commandClasses.find(c => c.name.toLowerCase().slice(0, c.name.length - 7) == key);
				if (!CommandClass) return ctx.respond("Command not found in file. If the command class name does not start with the command name, " +
					"provide an argument for the full class name before \"Command\", replacing all numbers in the command with the word.", {level: "warning"});

				const newCommand = new CommandClass();
				newCommand.categoryID = command.categoryID;
				ctx.bot.commands.set(commandName, newCommand);
				if (newCommand.aliases.length > 0) {
					const toRemoveAliases = ctx.bot.aliases.filter(alias => alias == commandName);
					for (const alias of toRemoveAliases.keys()) {
						ctx.bot.aliases.delete(alias);
					}
					for (const alias of newCommand.aliases) {
						ctx.bot.aliases.set(alias, newCommand.name);
					}
				}
				ctx.respond("The command **" + command.name + "** was reloaded.");
			} catch (err) {
				return ctx.respond("A problem has occurred while trying to reload the command: `" + err + "`", {level: "warning"});
			}
		}
	},
	class UnloadSubcommand extends Command {
		constructor() {
			super({
				name: "unload",
				description: "Unload a regular command",
				args: [
					{
						name: "command",
						description: "The command name",
						type: "string",
						parsedType: "command",
						required: true
					}
				]
			});
		}

		async run(ctx) {
			const command = ctx.parsedArgs["command"],
				commandName = command.name,
				categoryData = ctx.bot.categories[command.categoryID];
			if (categoryData.name == "Core" || commandName == "eval") return ctx.respond("That command is not unloadable.", {level: "error"});

			const commandFile = categoryData.rawName + ".js",
				foundCmdFile = fs.existsSync("commands/advanced/" + commandFile) ? "../advanced/" + commandFile : "../" + commandFile;
			delete require.cache[require.resolve(foundCmdFile)];
			ctx.bot.commands.delete(commandName);
			if (command.aliases.length > 0) {
				const toRemoveAliases = ctx.bot.aliases.filter(alias => alias == command.name);
				for (const alias of toRemoveAliases.keys()) ctx.bot.aliases.delete(alias);
			}
			ctx.respond("The command **" + command.name + "** was unloaded.");
		}
	}
];

class CommandsCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "commands",
			description: "Bot command management",
			subcommandGroups: [
				{
					name: "slash",
					description: "Slash commands",
					subcommands: slashSubcommands
				},
				{
					name: "regular",
					description: "Regular commands",
					subcommands: regularSubcommands
				}
			]
		});
	}
}

module.exports = CommandsCommandGroup;
