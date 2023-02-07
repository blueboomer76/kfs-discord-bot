const {SlashCommandBuilder} = require("@discordjs/builders"),
	{capitalize} = require("../modules/functions.js");

function addCommandArgOptions(subcmd, argData) {
	for (const arg of argData) {
		const fn = option => {
			option.setName(arg.name);
			option.setDescription(arg.description);

			if (arg.type == "integer" || arg.type == "number" || arg.type == "string") {
				if (arg.choices) {
					option.addChoices(...arg.choices);
				} else if (arg.type != "string") {
					if (arg.min) option.setMinValue(arg.min);
					if (arg.max) option.setMaxValue(arg.max);
				}
			}
			if (arg.required) option.setRequired(true);

			return option;
		};

		switch (arg.type) {
			case "boolean": subcmd.addBooleanOption(fn); break;
			case "channel": subcmd.addChannelOption(fn); break;
			case "integer": subcmd.addIntegerOption(fn); break;
			case "number": subcmd.addNumberOption(fn); break;
			case "role": subcmd.addRoleOption(fn); break;
			case "string": subcmd.addStringOption(fn); break;
			case "user": subcmd.addUserOption(fn);
		}
	}
}

class CommandGroup {
	constructor(props) {
		this.name = props.name;

		this.builder = new SlashCommandBuilder();
		this.builder.setName(props.name);

		const desc = props.description || capitalize(props.name) + " commands";
		this.builder.setDescription(desc);

		// Detect the type of commands expected
		if (props.subcommandGroups) {
			if (!Array.isArray(props.subcommandGroups) || props.subcommandGroups.length == 0) {
				throw new TypeError("Expected 'subcommandGroups' to be a nonempty array");
			}

			this.subcommandGroups = [];

			for (const subcmdGroupData of props.subcommandGroups) {
				if (!Array.isArray(subcmdGroupData.subcommands) || subcmdGroupData.subcommands.length == 0) {
					throw new TypeError("Expected 'subcommands' to be a nonempty array");
				}

				const subcommands = [];

				this.builder.addSubcommandGroup(subcmdGroup => {
					subcmdGroup.setName(subcmdGroupData.name);
					subcmdGroup.setDescription(subcmdGroupData.description);

					for (const SubcommandClass of subcmdGroupData.subcommands) {
						const subcommand = new SubcommandClass();
						subcommand.fullName = this.name + " " + subcmdGroupData.name + " " + subcommand.name;

						subcmdGroup.addSubcommand(subcmd => {
							subcmd.setName(subcommand.name);
							subcmd.setDescription(subcommand.description);

							if (subcommand.args.length > 0) addCommandArgOptions(subcmd, subcommand.args);

							return subcmd;
						});

						subcommands.push(subcommand);
					}

					return subcmdGroup;
				});

				this.subcommandGroups.push({
					name: subcmdGroupData.name,
					subcommands: subcommands
				});
			}
		} else if (props.subcommands) {
			if (!Array.isArray(props.subcommands) || props.subcommands.length == 0) {
				throw new TypeError("Expected 'subcommands' to be a nonempty array");
			}

			this.subcommands = [];

			for (const SubcommandClass of props.subcommands) {
				const subcommand = new SubcommandClass();
				subcommand.fullName = this.name + " " + subcommand.name;

				this.builder.addSubcommand(subcmd => {
					subcmd.setName(subcommand.name);
					subcmd.setDescription(subcommand.description);

					if (subcommand.args.length > 0) addCommandArgOptions(subcmd, subcommand.args);

					return subcmd;
				});

				this.subcommands.push(subcommand);
			}
		} else if (props.command) {
			const command = new props.command();
			command.fullName = this.name;

			if (command.args.length > 0) addCommandArgOptions(this.builder, command.args);

			this.command = command;
		} else {
			throw new Error("Expected one of these properties: 'subcommandGroups', 'subcommands', 'command'");
		}
	}

	getType() {
		if (this.subcommandGroups) {
			return "subcommandGroup";
		} else if (this.subcommands) {
			return "subcommand";
		} else {
			return "command";
		}
	}
}

module.exports = CommandGroup;
