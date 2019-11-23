const {parsePerm} = require("../modules/functions.js"),
	cdChecker = require("../modules/cooldownChecker.js"),
	argParser = require("../utils/argsParser.js");

async function execCommand(runCommand, bot, message, args) {
	if (runCommand.disabled) return {cmdErr: "This command is currently disabled.", noLog: true};
	if (message.guild) {
		if (runCommand.nsfw && !message.channel.nsfw) return {cmdErr: "Please go to a NSFW channel to use this command.", noLog: true};
		if (message.guild.large && !message.member) await message.guild.fetchMember(message.author);
	} else if (!runCommand.allowDMs) {
		return {cmdErr: "This command cannot be used in Direct Messages.", noLog: true};
	}

	const requiredPerms = runCommand.perms;
	let userPermsAllowed = null, roleAllowed = null, faultMsg = "";
	if (message.guild) {
		if (requiredPerms.bot.length > 0) {
			for (const perm of requiredPerms.bot) {
				if (!message.guild.me.hasPermission(perm)) {
					faultMsg += "I need these permissions to run this command:\n" + requiredPerms.bot.map(p => parsePerm(p)).join(", ");
					break;
				}
			}
		}
		if (requiredPerms.user.length > 0) {
			userPermsAllowed = true;
			for (const perm of requiredPerms.user) {
				if (!message.member.hasPermission(perm)) {
					userPermsAllowed = false;
					break;
				}
			}
		}
		if (requiredPerms.role) roleAllowed = message.member.roles.some(role => role.name.toLowerCase() == requiredPerms.role.toLowerCase());
		if (userPermsAllowed == false && roleAllowed == null) {
			faultMsg += "\nYou need these permissions to run this command:\n" + requiredPerms.user.map(p => parsePerm(p)).join(", ");
		} else if (userPermsAllowed == false && roleAllowed == false) {
			faultMsg += `\nYou need these permissions or a role named **${requiredPerms.role}** to run this command:\n` +
				requiredPerms.user.map(p => parsePerm(p)).join(", ");
		} else if (userPermsAllowed == null && roleAllowed == false) {
			faultMsg += `\nYou need a role named **${requiredPerms.role}** to run this command.`;
		}
	}
	if (requiredPerms.level > 0) {
		const permLevels = bot.permLevels;
		let userLevel = 0;
		for (let i = 0; i < permLevels.length; i++) {
			if (permLevels[i].validate(message)) userLevel = i;
		}
		if (userLevel < requiredPerms.level) {
			const faultDesc = permLevels[requiredPerms.level].desc ? ` (${permLevels[requiredPerms.level].desc})` : "";
			faultMsg += `\nYou need to be a ${bot.permLevels[requiredPerms.level].name} to run this command` + faultDesc;
		}
	}
	if (faultMsg.length > 0) return {errTitle: "Command permission error", cmdWarn: faultMsg, noLog: true};

	let flags = [];
	if (runCommand.flags.length > 0) {
		const parsedFlags = await argParser.parseFlags(bot, message, args, runCommand.flags);
		if (parsedFlags.error) {
			if (parsedFlags.error.startsWith("Multiple")) return {cmdErr: `**${parsedFlags.error}**\n` + parsedFlags.message, noLog: true};
			return {
				cmdErr: `**${parsedFlags.error}**\n` + parsedFlags.message + `\n▫ | Correct usage: \`${runCommand.usage}\``,
				noLog: true
			};
		}
		flags = parsedFlags.flags;
		args = parsedFlags.newArgs;
	}
	args = await argParser.parseArgs(bot, message, args, runCommand);
	if (args.error) {
		if (args.error.startsWith("Multiple")) return {cmdErr: `**${args.error}**\n` + args.message, noLog: true};
		return {
			cmdErr: `**${args.error}**\n` + args.message + "\n" +
				`▫ | Correct usage: \`${runCommand.usage}\`\n` +
				`▫ | Get more help by using \`${bot.prefix}help ${runCommand.name}\``,
			noLog: true
		};
	}

	return runCommand.run(bot, message, args, flags);
}

module.exports = async (bot, message) => {
	bot.cache.stats.messageCurrentTotal++;
	if (message.author.bot) return;
	if (!message.content.startsWith(bot.prefix) && !bot.mentionPrefix.test(message.content)) {
		if (bot.cache.phone.channels.length > 1 && bot.cache.phone.channels.some(c => c.id == message.channel.id)) {
			bot.handlePhoneMessage(message);
		}
	} else {
		const mentionMatch = message.content.match(bot.mentionPrefix),
			args = message.content.slice(mentionMatch ? mentionMatch[0].length : bot.prefix.length).trim().split(/ +/g),
			command = args.shift().toLowerCase(),
			runCommand = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));

		if (!runCommand) return;
		if (message.guild && !message.channel.permissionsFor(bot.user).has("SEND_MESSAGES")) return;
		if (cdChecker.check(bot, message, runCommand) == false) return;

		execCommand(runCommand, bot, message, args)
			.then(runRes => {
				/*
					runRes is sometimes returned as an object like this:
					{
						cmdTitle: "Error title",
						cmdErr: "Some error",
						cooldown: 90000,
						noLog: true
					}
				*/

				if (runRes) {
					if (runRes.cmdWarn) {
						const errTitle = runRes.errTitle ? `**${runRes.errTitle}**\n` : "";
						message.channel.send(`⚠ ${errTitle}${runRes.cmdWarn}`);
					} else if (runRes.cmdErr) {
						const errTitle = runRes.errTitle ? `**${runRes.errTitle}**\n` : "";
						message.channel.send(`❗ ${errTitle}${runRes.cmdErr}`);
					}
				}

				if (!bot.ownerIds.includes(message.author.id) && runCommand.cooldown.time != 0 && (!runRes || runRes.cooldown)) {
					cdChecker.addCooldown(bot, message, runCommand, {
						name: runCommand.cooldown.name || null,
						time: runRes ? runRes.cooldown : null
					});
				}

				/*
				The below condition can be replaced with this when bot owners are to be ignored.
				if ((!runRes || !runRes.noLog) && runCommand.name != "help" && runCommand.name != "phone" && !bot.ownerIds.includes(message.author.id)) {
				*/

				if (!runRes || !runRes.noLog) {
					bot.cache.stats.commandUsage[runCommand.name] = (bot.cache.stats.commandUsage[runCommand.name] || 0) + 1;
				} else {
					bot.cache.stats.commandCurrentTotal++;
				}
			})
			.catch(err => {
				let errMsg = "⚠ **Internal Command Error** ```javascript\n" + err.stack + "```";
				if (!bot.ownerIds.includes(message.author.id)) {
					errMsg += "If this keeps happening, come to the official server to discuss this bug and error stack.";
				}
				message.channel.send(errMsg);
			});
	}
};