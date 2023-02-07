const {MessageEmbed} = require("discord.js"),
	cdChecker = require("../modules/cooldownChecker.js"),
	{getReadableName} = require("../modules/functions.js"),
	objResolver = require("../utils/objResolver.js");

const cwdRegex = new RegExp(process.cwd().replace(/\\/g, "\\\\"), "g");

class CommandContext {
	constructor(interaction) {
		this.interaction = interaction;
		this.bot = interaction.client;
	}

	checkCommandSync() {
		// If the slash command does not exist on the bot, why even check arguments in the first place?
		const invokedSlashCommand = this.bot.slashCommands.get(this.interaction.commandName);
		if (!invokedSlashCommand) {
			this.respond(`Command ${this.interaction.commandName} was not found on bot locally!`, {level: "error"});
			return;
		}

		this.slashCommand = invokedSlashCommand;

		// Try to find a subcommand with the matching subcommand group and subcommand name
		const discordOptions = this.interaction.options.data[0];
		if (discordOptions && discordOptions.type == "SUB_COMMAND_GROUP") {
			const subcommandGroupName = discordOptions.name;
			const subcommandGroup = this.slashCommand.subcommandGroups.find(scg => scg.name == subcommandGroupName);
			if (!subcommandGroup) {
				this.respond(`Subcommand group ${subcommandGroupName} not found on bot`, {level: "error"});
				return;
			}

			const subcommandName = discordOptions.options[0].name;
			const subcommand = subcommandGroup.subcommands.find(sc => sc.name == subcommandName);
			if (!subcommand) {
				this.respond(`Subcommand ${subcommandName} not found on bot`, {level: "error"});
				return;
			}

			this.parsedCmdData = subcommand;
			this.subcommandGroupName = subcommandGroupName;
			this.subcommandName = subcommandName;
			this.fullCommand = this.slashCommand.name + " " + this.subcommandGroupName + " " + this.subcommandName;
		} else if (discordOptions && discordOptions.type == "SUB_COMMAND") {
			const subcommandName = discordOptions.name;
			const subcommand = this.slashCommand.subcommands.find(sc => sc.name == subcommandName);
			if (!subcommand) {
				this.respond(`Subcommand ${subcommandName} not found on bot`, {level: "error"});
				return;
			}

			this.parsedCmdData = subcommand;
			this.subcommandGroupName = null;
			this.subcommandName = subcommandName;
			this.fullCommand = this.slashCommand.name + " " + this.subcommandName;
		} else {
			this.parsedCmdData = this.slashCommand.command;
			this.subcommandGroupName = null;
			this.subcommandName = null;
			this.fullCommand = this.slashCommand.name;
		}
	}

	async checkAllConditions() {
		const precheckRes = this.precheck();
		if (precheckRes != true) {
			this.respond(precheckRes, {level: "error"});
			return;
		}

		const permissionCheckRes = this.checkPermissions();
		if (permissionCheckRes != true) {
			this.respond(permissionCheckRes, {level: "error", title: "Command permission error"});
			return;
		}

		const cooldownRes = this.checkCooldown();
		if (cooldownRes != true) {
			this.respond({content: cooldownRes, ephemeral: cooldownRes.notified}, {title: "⛔ Cooldown:"});
			return;
		}

		const argCheckRes = await this.parseArguments();
		if (argCheckRes.error) {
			this.respond(argCheckRes.message, {level: "error", title: argCheckRes.error});
		}
	}

	precheck() {
		if (this.parsedCmdData.disabled) return "This command and its subcommands are currently disabled.";

		if (this.interaction.inCachedGuild()) {
			if (this.parsedCmdData.nsfw && !this.interaction.channel.nsfw) {
				return "Please go to a NSFW channel to use this command.";
			}
		} else if (!this.parsedCmdData.allowDMs) {
			return "This command cannot be used in Direct Messages.";
		}

		return true;
	}

	checkPermissions() {
		const requiredPerms = this.parsedCmdData.perms;

		let userPermsAllowed = null, roleAllowed = null, faultMsg = "";
		if (this.interaction.inCachedGuild()) {
			if (requiredPerms.bot.length > 0) {
				const botPerms = this.interaction.channel.permissionsFor(this.bot.user);
				if (requiredPerms.bot.some(perm => !botPerms.has(perm))) {
					faultMsg += "I need these permissions to run this command:\n" + requiredPerms.bot.map(getReadableName).join(", ");
				}
			}
			if (requiredPerms.user.length > 0) {
				const userPerms = this.interaction.channel.permissionsFor(this.interaction.user);
				userPermsAllowed = requiredPerms.user.every(perm => userPerms.has(perm));
			}
			if (requiredPerms.role) {
				roleAllowed = this.interaction.user.id == this.interaction.guild.ownerId ||
					this.interaction.member.roles.cache.some(role => role.name.toLowerCase() == requiredPerms.role.toLowerCase());
			}
			if (userPermsAllowed == false && roleAllowed == null) {
				faultMsg += "\nYou need these permissions to run this command:\n" + requiredPerms.user.map(getReadableName).join(", ");
			} else if (userPermsAllowed == false && roleAllowed == false) {
				faultMsg += `\nYou need to have these permissions, be the server owner, or have a role named **${requiredPerms.role}** to run this command:\n` +
					requiredPerms.user.map(getReadableName).join(", ");
			} else if (userPermsAllowed == null && roleAllowed == false) {
				faultMsg += `\nYou need to be the server owner or have a role named **${requiredPerms.role}** to run this command.`;
			}
		}
		if (requiredPerms.level > 0) {
			const permLevels = this.bot.permLevels;
			let userLevel = 0;
			for (let i = 0; i < permLevels.length; i++) {
				if (permLevels[i].validate(this.interaction)) userLevel = i;
			}
			if (userLevel < requiredPerms.level) {
				const faultDesc = permLevels[requiredPerms.level].desc ? ` (${permLevels[requiredPerms.level].desc})` : "";
				faultMsg += `\nYou need to be a ${this.bot.permLevels[requiredPerms.level].name} to run this command` + faultDesc;
			}
		}
		if (faultMsg.length > 0) return faultMsg;

		return true;
	}

	checkCooldown() {
		this.cdBypass = this.bot.ownerIDs.includes(this.interaction.user.id) || this.parsedCmdData.cooldown.time == 0;

		const userCheck = cdChecker.check(this.bot, this.interaction, this.parsedCmdData, "user"),
			channelCheck = cdChecker.check(this.bot, this.interaction, this.parsedCmdData, "channel"),
			guildCheck = cdChecker.check(this.bot, this.interaction, this.parsedCmdData, "guild");
		if (!this.cdBypass) {
			if (userCheck != true) return userCheck;
			if (channelCheck != true) return channelCheck;
			if (guildCheck != true) return guildCheck;
		}

		return true;
	}

	async parseArguments() {
		this.parsedArgs = {};

		// Ignore subcommand groups and subcommands
		const discordOptions = this.interaction.options.data[0];
		let rawArgs;
		if (discordOptions && discordOptions.type == "SUB_COMMAND_GROUP") {
			rawArgs = discordOptions.options[0].options || [];
		} else if (discordOptions && discordOptions.type == "SUB_COMMAND") {
			rawArgs = discordOptions.options || [];
		} else {
			rawArgs = this.interaction.options.data;
		}

		for (const opt of rawArgs) {
			const argName = opt.name;
			const matchingArg = this.parsedCmdData.args.find(arg => arg.name == argName);

			if (!matchingArg) return {error: "Internal Command Error", message: `Argument ${argName} missing in bot locally`};

			let parsedValue;
			switch (matchingArg.type) {
				case "boolean":
					parsedValue = this.interaction.options.getBoolean(argName);
					break;
				case "string": {
					const rawValue = this.interaction.options.getString(argName);
					if (matchingArg.parsedType) {
						const resolved = await objResolver.resolve(this.interaction, rawValue, matchingArg);
						if (!resolved) {
							const userInput = rawValue.length > 1500 ? rawValue.slice(0, 1500) + "..." : rawValue;
							let argErrorMsg = `\`${userInput}\` is not a valid ${matchingArg.parsedType}`;
							if (matchingArg.errorMsg) {
								argErrorMsg = matchingArg.errorMsg;
							} else if (matchingArg.parsedType == "image") {
								argErrorMsg = "A valid mention, image URL, or emoji must be provided";
							}
							argErrorMsg += `\n▫ | Get more help by using \`/help ${this.fullCommand}\``;

							return {error: true, message: argErrorMsg};
						}

						if (matchingArg.parsedType == "emoji") {
							if (resolved.length > 1) {
								const endMsg = resolved.length > 20 ? "...and " + resolved.length + " more." : "";
								return {
									error: "Multiple emojis found",
									message: "Multiple emojis were found:\n```" + resolved.slice(0, 20).map(obj => `${obj.name} (${obj.id})`).join("\n") +
										"```" + endMsg
								};
							}

							parsedValue = resolved[0];
						} else {
							parsedValue = resolved;
						}
					} else {
						parsedValue = rawValue;
					}
					break;
				}
				case "integer":
					parsedValue = this.interaction.options.getInteger(argName);
					break;
				case "number":
					parsedValue = this.interaction.options.getNumber(argName);
					break;
				case "user":
					parsedValue = this.interaction.options.getMember(argName);
					break;
				case "channel":
					parsedValue = this.interaction.options.getChannel(argName);
					break;
				case "role":
					parsedValue = this.interaction.options.getRole(argName);
			}

			this.parsedArgs[argName] = parsedValue;
		}

		return true;
	}

	async runCommand() {
		// Runs the command and handles any errors that come from it
		try {
			await this.parsedCmdData.run(this);
		} catch (err) {
			let e = err instanceof Error && err.stack ? err.stack : err;
			if (typeof e == "string") {
				e = e.replace(cwdRegex, "[...]");
				if (e.length > 1500) e = e.slice(0, 1500) + "...";
			}

			await this.respond("```javascript" + "\n" + e + "```", {level: "warning", title: "Internal Command Error"});
		}

		if (!this.cdBypass) {
			cdChecker.addCooldown(this.bot, this.interaction, this.slashCommand, this.cooldown);
		}

		/*
			The below condition can be replaced with this when bot owners and select commands are to be ignored.
			if (!this.noLog && !this.errored && this.slashCommand.name != "help" && this.slashCommand.name != "phone" &&
				!this.bot.ownerIDs.includes(interaction.user.id)) {
		*/
		if (!this.noLog && !this.errored) {
			this.bot.cache.stats.slashCommandUsages[this.parsedCmdData.fullName] =
				(this.bot.cache.stats.slashCommandUsages[this.parsedCmdData.fullName] || 0) + 1;
		} else {
			this.bot.cache.stats.interactionCurrentTotal++;
		}
	}

	replyDynamic(responseData) {
		if (!this.interaction.deferred && !this.interaction.replied) {
			return this.interaction.reply(responseData);
		} else {
			return this.interaction.editReply(responseData);
		}
	}

	respond(replyOptions, options) {
		if (!options) options = {};

		this.noLog = options.noLog;
		this.cooldown = Object.assign(this.parsedCmdData.cooldown, options.cooldown || {});

		if (options.level == "warning" || options.level == "error") {
			this.errored = true;

			const levelEmoji = options.level == "warning" ? "⚠" : "❗";

			let toAppend = levelEmoji + " ";
			if (options.title) toAppend += "**" + options.title + "**\n";

			if (replyOptions instanceof MessageEmbed) {
				replyOptions.setColor("RED")
					.setTitle("Command Error")
					.setDescription(toAppend + replyOptions.description);
				replyOptions = {embeds: [replyOptions]};
			} else if (typeof replyOptions == "string") {
				replyOptions = toAppend + replyOptions;
			} else if (replyOptions.content) {
				replyOptions.content = toAppend + replyOptions.content;
			}
		} else {
			if (replyOptions instanceof MessageEmbed) {
				replyOptions = {embeds: [replyOptions]};
			} else if (typeof replyOptions == "number") {
				replyOptions = replyOptions.toString();
			}
		}

		if (options.followUp) {
			return this.interaction.followUp(replyOptions);
		} else {
			return this.replyDynamic(replyOptions);
		}
	}
}

module.exports = CommandContext;
