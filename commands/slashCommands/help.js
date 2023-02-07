const {MessageEmbed} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	{getReadableName} = require("../../modules/functions.js");

const subcommands = [
	class HelpAllSubcommand extends Command {
		constructor() {
			super({
				name: "all",
				description: "View the bot's commands",
				allowDMs: true,
				cooldown: {
					time: 8000,
					type: "user"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}

		async run(ctx) {
			const commandNames = [...ctx.bot.slashCommands.keys()];

			let cmds = ctx.bot.slashCommands;
			if (!ctx.bot.ownerIDs.includes(ctx.interaction.user.id) && !ctx.bot.adminIDs.includes(ctx.interaction.user.id)) {
				cmds = cmds.filter(cmd => !cmd.cmdData.disabled && !cmd.cmdData.hidden);
			}

			ctx.respond(new MessageEmbed()
				.setTitle("All bot commands")
				.setDescription("Use `/help <command>` to get help for a command, e.g. `/help search`\n\n" +
					commandNames.join(", "))
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter({text: `There are ${cmds.size} commands available.`})
			);

		}
	},
	class HelpCommandSubcommand extends Command {
		constructor() {
			super({
				name: "command",
				description: "View command details",
				allowDMs: true,
				args: [
					{
						name: "command",
						description: "Command to get help for",
						type: "string",
						parsedType: "slashCommand",
						parsedTypeParams: {matchType: "partial"}
					}
				],
				cooldown: {
					time: 8000,
					type: "user"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}

		async run(ctx) {
			const command = ctx.parsedArgs["command"];

			const helpEmbed = new MessageEmbed().setColor(Math.floor(Math.random() * 16777216));
			if (command.subcommandGroups) {
				helpEmbed.addField("Subcommands", command.subcommandGroups.map(scg => {
					return scg.subcommands.map(sc => "/" + sc.fullName).join("\n");
				}).join("\n"));
			} else if (command.subcommands) {
				helpEmbed.addField("Subcommands", command.subcommands.map(sc => "/" + sc.fullName).join("\n"));
			} else {
				helpEmbed.setTitle("Help - " + command.fullName);

				const commandPerms = command.perms,
					permReq = {
						bot: commandPerms.bot.length > 0 ? commandPerms.bot.map(getReadableName).join(", ") : "None",
						user: commandPerms.user.length > 0 ? commandPerms.user.map(getReadableName).join(", ") : "None",
						role: commandPerms.role ? `\nRequires having a role named ${commandPerms.role}.` : "",
						level: commandPerms.level > 0 ? `\nRequires being ${ctx.bot.permLevels[commandPerms.level].name}.` : ""
					};

				helpEmbed.setFooter({text: "Don't include the usage symbols when running the command."})
					.addField("Description", command.fullDescription);
				if (command.args.length > 0) {
					helpEmbed.addField("Options", command.args.map(arg => arg.name).join("\n"));
				}
				helpEmbed.addField("Usage", "`/" + command.usage + "`");
				if (command.examples.length > 0) helpEmbed.addField("Examples", command.examples.map(e => "`" + e + "`").join("\n"));
				if (command.allowDMs) helpEmbed.addField("Allows DMs", "Yes");
				if (commandPerms.bot.length > 0 || commandPerms.user.length > 0 || commandPerms.role || commandPerms.level > 0) {
					helpEmbed.addField("Permissions", `Bot - ${permReq.bot}\n` + `User - ${permReq.user}${permReq.role}${permReq.level}`);
				}
			}

			ctx.respond(helpEmbed);
		}
	},
	class HelpArgumentsSubcommand extends Command {
		constructor() {
			super({
				name: "arguments",
				description: "View argument help",
				allowDMs: true,
				cooldown: {
					time: 8000,
					type: "user"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}

		async run(ctx) {
			ctx.respond(new MessageEmbed()
				.setTitle("Argument Info")
				.setColor(Math.floor(Math.random() * 16777216))
				.addField("Images", "Images must be one of these forms:\n" +
					"- Link to an image ending in .gif, .jpg, .jpeg, or .png\n" +
					"- A user mention\n" +
					"- An emoji (e.g. ⬆)\n")
				.addField("Colors", "Colors must be in one of these forms:\n" +
					"- Decimal (`decimal:number`), e.g. `decimal:1234567` [Range: `decimal:0`-`decimal:16777215`]\n" +
					"- Hexadecimal (`#rrggbb` or `rrggbb`), e.g. `#112233` or `112233` [Range: `#000000`-`#ffffff`]\n" +
					"- `rgb(r,g,b)`, e.g. `rgb(123,145,255)` [Range: `rgb(0,0,0)`-`rgb(255,255,255)`]\n" +
					"- CSS color name, e.g. `blue`\n" +
					"- `r,g,b`, e.g. `123,145,255` [Range: `0,0,0`-`255,255,255`]\n" +
					"- `hsl(h,s,l)`, e.g. `hsl(123,45,67)` or `hsl(123,45%,67%)` [Range: `hsl(0,0,0)`-`hsl(359,100,100)`]")
			);
		}
	}
];

class HelpCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "help",
			description: "Get help for the bot",
			subcommands: subcommands
		});
	}
}

module.exports = HelpCommandGroup;
