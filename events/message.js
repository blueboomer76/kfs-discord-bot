const cdChecker = require("../modules/cooldownChecker.js");
const {parsePerm} = require("../modules/functions.js");
const argParser = require("../utils/argsParser.js");
const config = require("../config.json");

module.exports = async (bot, message) => {
	bot.cache.stats.messageCurrentTotal++;
	if (message.author.bot) return;
	let mentionMatch = message.content.match(bot.mentionPrefix);
	if (!message.content.startsWith(config.prefix) && !mentionMatch) {
		if (bot.cache.phone.channels.length > 1 && bot.cache.phone.channels.includes(message.channel.id)) {
			if (message.guild && !message.channel.permissionsFor(bot.user).has(["VIEW_CHANNEL", "SEND_MESSAGES"])) return;
			bot.handlePhoneMessage(message);
		}
	} else {
		let prefixLength = mentionMatch ? mentionMatch[0].length : config.prefix.length;
		let args = message.content.slice(prefixLength).trim().split(/ +/g);
		let command = args.shift().toLowerCase();
		let runCommand = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
		if (!runCommand) return;

		// Check things before performing the command
		if (message.guild && !message.channel.permissionsFor(bot.user).has(["VIEW_CHANNEL", "SEND_MESSAGES"])) return;
		if (!message.guild && !runCommand.allowDMs) return message.channel.send("This command cannot be used in Direct Messages.")

		let requiredPerms = runCommand.perms, userPermsAllowed = null, roleAllowed = null, faultMsg = "";
		if (message.guild) {
			if (requiredPerms.bot.length > 0) {
				for (const perm of requiredPerms.bot) {
					if (!message.channel.permissionsFor(bot.user).has(perm)) {
						faultMsg += `I need these permissions to run this command:\n${requiredPerms.bot.map(p => parsePerm(p)).join(", ")}`
						break;
					}
				}
			}
			if (requiredPerms.user.length > 0) {
				userPermsAllowed = true;
				for (const perm of requiredPerms.user) {
					if (!message.channel.permissionsFor(message.author).has(perm)) {
						userPermsAllowed = false;
						break;
					}
				}
			}
			if (requiredPerms.role) {
				if (message.author.id == message.guild.owner.id || message.member.roles.find(role => role.name.toLowerCase() == requiredPerms.role.toLowerCase())) {
					roleAllowed = true;
				} else {
					roleAllowed = false;
				}
			}
			if (userPermsAllowed == false && roleAllowed == null) {
				faultMsg += `\nYou need these permissions to run this command:\n${requiredPerms.user.map(p => parsePerm(p)).join(", ")}`
			} else if (userPermsAllowed == false && roleAllowed == false) {
				faultMsg += `\nYou need to have these permissions, be the server owner, or have a role named **${requiredPerms.role}** to run this command:\n${requiredPerms.user.map(p => parsePerm(p)).join(", ")}`
			} else if (userPermsAllowed == null && roleAllowed == false) {
				faultMsg += `\nYou need to be the server owner or have a role named **${requiredPerms.role}** to run this command.`
			}
		}
		if (requiredPerms.level > 0) {
			let permLevels = bot.permLevels;
			let userLevel = 0;
			for (let i = 0; i < permLevels.length; i++) {
				if (permLevels[i].validate(message)) userLevel = i;
			}
			if (userLevel < requiredPerms.level) {
				let faultDesc = permLevels[requiredPerms.level].desc ? ` (${permLevels[requiredPerms.level].desc})` : "";
				faultMsg += `\nYou need to be a ${bot.permLevels[requiredPerms.level].name} to run this command${faultDesc}`;
			}
		}
		if (faultMsg.length > 0) return message.channel.send(faultMsg);

		if (cdChecker.check(bot, message, runCommand.name) == false) return;

		if (runCommand.startTyping) {
			message.channel.startTyping();
			setTimeout(() => message.channel.stopTyping(), 10000);
		}

		let flags = [];
		if (runCommand.flags.length > 0) {
			let parsedFlags = argParser.parseFlags(bot, message, args, runCommand.flags);
			if (parsedFlags.error) {
				return message.channel.send(`⚠ **${parsedFlags.error}**:\n${parsedFlags.message}\n*The correct usage is:* \`${runCommand.usage}\``);
			}
			flags = parsedFlags.flags;
			args = parsedFlags.newArgs;
		}
		args = argParser.parseArgs(bot, message, args, runCommand.args);
		if (args.error) {
			if (args.error.startsWith("Multiple")) return message.channel.send(`⚠ **${args.error}**\n${args.message}`);
			return message.channel.send(`⚠ **${args.error}**\n${args.message}\n*The correct usage is:* \`${runCommand.usage}\``);
		}

		runCommand.run(bot, message, args, flags)
		.catch(err => {
			let e = err && err.stack ? err.stack : err;
			if (e && e.length > 1500) e = e.slice(0, 1500) + "...";
			message.channel.send(`⚠ **Something went wrong with this command**\`\`\`javascript\n${e}\`\`\``);
		});
		if (runCommand.cooldown.time != 0) cdChecker.addCooldown(bot, message, runCommand.name);

		/*
		This is the code if owners are to be ignored.
		
		if (!bot.ownerIDs.includes(message.author.id)) {
			let commandUsage = bot.cache.stats.commandUsages.find(u => u.command == runCommand.name);
			if (commandUsage) {
				commandUsage.uses++;
			} else {
				bot.cache.stats.commandUsages.push({
					command: runCommand.name,
					uses: 1
				})
			}
		} else {
			bot.cache.stats.commandCurrentTotal++;
		}
		*/
		let commandUsage = bot.cache.stats.commandUsages.find(u => u.command == runCommand.name);
		if (commandUsage) {
			commandUsage.uses++;
		} else {
			bot.cache.stats.commandUsages.push({
				command: runCommand.name,
				uses: 1
			})
		}
	}
};
