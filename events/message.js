const cdChecker = require("../modules/cooldownChecker.js"),
	{parsePerm} = require("../modules/functions.js"),
	argParser = require("../utils/argsParser.js");

async function execCommand(runCommand, bot, message, args) {
	if (runCommand.disabled) return {cmdErr: "This command is currently disabled."}
	if (!message.guild && !runCommand.allowDMs) return {cmdErr: "This command cannot be used in Direct Messages."}
	if (message.guild && runCommand.nsfw && !message.channel.nsfw) return {cmdErr: "Please go to a NSFW channel to use this command."}
	if (message.guild && message.guild.large && !message.member) await message.guild.fetchMember(message.author);

	const requiredPerms = runCommand.perms;
	let userPermsAllowed = null, roleAllowed = null, faultMsg = "";
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
		if (requiredPerms.role) roleAllowed = message.author.id == message.guild.owner.id || message.member.roles.some(role => role.name.toLowerCase() == requiredPerms.role.toLowerCase())
		if (userPermsAllowed == false && roleAllowed == null) {
			faultMsg += `\nYou need these permissions to run this command:\n${requiredPerms.user.map(p => parsePerm(p)).join(", ")}`
		} else if (userPermsAllowed == false && roleAllowed == false) {
			faultMsg += `\nYou need to have these permissions, be the server owner, or have a role named **${requiredPerms.role}** to run this command:\n${requiredPerms.user.map(p => parsePerm(p)).join(", ")}`
		} else if (userPermsAllowed == null && roleAllowed == false) {
			faultMsg += `\nYou need to be the server owner or have a role named **${requiredPerms.role}** to run this command.`
		}
	}
	if (requiredPerms.level > 0) {
		const permLevels = bot.permLevels;
		let userLevel = 0;
		for (let i = 0; i < permLevels.length; i++) {
			if (permLevels[i].validate(message)) userLevel = i;
		}
		if (userLevel < requiredPerms.level) {
			let faultDesc = permLevels[requiredPerms.level].desc ? ` (${permLevels[requiredPerms.level].desc})` : "";
			faultMsg += `\nYou need to be a ${bot.permLevels[requiredPerms.level].name} to run this command${faultDesc}`;
		}
	}
	if (faultMsg.length > 0) return {errTitle: "Command permission error", cmdWarn: faultMsg};

	let flags = [];
	if (runCommand.flags.length > 0) {
		let parsedFlags = argParser.parseFlags(bot, message, args, runCommand.flags);
		if (parsedFlags.error) {
			if (parsedFlags.error.startsWith("Multiple")) return {cmdErr: `**${parsedFlags.error}**\n${parsedFlags.message}`};
			return {cmdErr: `**${parsedFlags.error}**\n${parsedFlags.message}\n*The correct usage is:* \`${runCommand.usage}\``};
		}
		flags = parsedFlags.flags;
		args = parsedFlags.newArgs;
	}
	args = argParser.parseArgs(bot, message, args, runCommand.args);
	if (args.error) {
		if (args.error.startsWith("Multiple")) return {cmdErr: `**${args.error}**\n${args.message}`};
		return {cmdErr: `**${args.error}**\n${args.message}\n*The correct usage is:* \`${runCommand.usage}\``};
	}
		
	return runCommand.run(bot, message, args, flags);
}

module.exports = async (bot, message) => {
	bot.cache.stats.messageCurrentTotal++;
	if (message.author.bot) return;
	const mentionMatch = message.content.match(bot.mentionPrefix);
	if (!message.content.startsWith(bot.prefix) && !mentionMatch) {
		if (bot.cache.phone.channels.length > 1 && bot.cache.phone.channels.some(c => c.id == message.channel.id)) {
			if (message.guild && !message.channel.permissionsFor(bot.user).has(["VIEW_CHANNEL", "SEND_MESSAGES"])) return;
			bot.handlePhoneMessage(message);
		}
	} else {
		let prefixLength = mentionMatch ? mentionMatch[0].length : bot.prefix.length,
			args = message.content.slice(prefixLength).trim().split(/ +/g),
			command = args.shift().toLowerCase(),
			runCommand = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));

		if (!runCommand) return;
		if (message.guild && !message.channel.permissionsFor(bot.user).has(["VIEW_CHANNEL", "SEND_MESSAGES"])) return;
		if (cdChecker.check(bot, message, runCommand) == false) return;

		execCommand(runCommand, bot, message, args)
		.then(runRes => {
			/*
				runRes is sometimes returned as an object like this:
				{
					cmdTitle: "Error title",
					cmdErr: "Some error",
					cooldown: {time: 90000},
					noLog: true
				}
			*/
			
			if (runRes) {
				if (runRes.cmdWarn) {
					const errTitle = runRes.errTitle ? `**${runRes.errTitle}**\n` : ""
					message.channel.send(`⚠ ${errTitle}${runRes.cmdWarn}`)
				} else if (runRes.cmdErr) {
					const errTitle = runRes.errTitle ? `**${runRes.errTitle}**\n` : ""
					message.channel.send(`❗ ${errTitle}${runRes.cmdErr}`)
				}
			}
			
			if (!bot.ownerIDs.includes(message.author.id) && runCommand.cooldown.time != 0 && (!runRes || runRes.cooldown)) {
				const orCooldown = runRes && runRes.cooldown ? runRes.cooldown : null;
				cdChecker.addCooldown(bot, message, runCommand.name, orCooldown);
			}
			
			/*
				This is the code if owners and select commands are to be ignored.
				
				if ((!runRes || (!runRes.noLog && !runRes.cmdWarn && !runRes.cmdErr)) && runCommand.name != "help" && runCommand.name != "phone" && !bot.ownerIDs.includes(message.author.id)) {
					const commandUsage = bot.cache.stats.commandUsages.find(u => u.command == runCommand.name);
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
			if (!runRes || (!runRes.noLog && !runRes.cmdWarn && !runRes.cmdErr)) {
				const commandUsage = bot.cache.stats.commandUsages.find(u => u.command == runCommand.name);
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
		})
		.catch(err => {
			let e = err && err.stack ? err.stack : err;
			if (e && e.length > 1500) e = e.slice(0, 1500) + "...";
			message.channel.send(`⚠ **Something went wrong with this command**\`\`\`javascript\n${e}\`\`\``);
		})
	}
};
