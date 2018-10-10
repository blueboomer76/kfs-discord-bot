const Discord = require("discord.js");
const argParser = require("../utils/argsParser.js");
const cdChecker = require("../modules/cooldownChecker.js");

module.exports = async (bot, message) => {
	bot.cache.stats.messageCurrentTotal++;
	if (message.author.bot) return;
	if (!message.content.startsWith(bot.prefix) && !bot.mentionPrefix.test(message.content)) {
		if (bot.cache.phone.channels.length > 1 && bot.cache.phone.channels.includes(message.channel.id)) {
			bot.handlePhoneMessage(message);
		}
	} else {
		if (message.guild && !message.channel.permissionsFor(bot.user).has("SEND_MESSAGES")) return;
		let mentionMatch = message.content.match(bot.mentionPrefix);
		let prefixSliceAmt = mentionMatch ? mentionMatch[0].length : bot.prefix.length;
		let args = message.content.slice(prefixSliceAmt).trim().split(/ +/g);
		let command = args.shift().toLowerCase();
		let runCommand = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
		if (!runCommand) return;
		
		// Check things before performing the command
		if (!message.guild && !runCommand.allowDMs) return message.channel.send("This command cannot be used in Direct Messages.")
		
		let requiredPerms = runCommand.perms, userPermsAllowed = true, roleAllowed = true, faultMsg = "";
		if (message.guild) {
			if (requiredPerms.bot.length > 0) {
				for (const perm of requiredPerms.bot) {
					if (!message.guild.me.hasPermission(perm)) {
						faultMsg += `I need these permissions to run this command:\n${requiredPerms.bot.join(", ")}`
						break;
					}
				}
			}
			if (requiredPerms.user.length > 0) {
				for (const perm of requiredPerms.user) {
					if (!message.member.hasPermission(perm)) {userPermsAllowed = false;}
				}
			}
			if (requiredPerms.role) {
				if (!message.member.roles.find(role => role.name == requiredPerms.role)) {roleAllowed = false;}
			}
			if (!userPermsAllowed || !roleAllowed) {
				if (!userPermsAllowed && !roleAllowed) {
					faultMsg += `You need these permissions or a role named **${requiredPerms.role}** to run this command:\n${requiredPerms.user.join(", ")}`
				} else if (!userPermsAllowed) {
					faultMsg += `You need these permissions to run this command:\n${requiredPerms.user.join(", ")}`
				} else {
					faultMsg += `You need a role named **${requiredPerms.role}** to run this command.`
				}
			}
		};
		if (requiredPerms.level > 0) {
			let permLevels = bot.permLevels;
			let userLevel = 0;
			for (let i = 0; i < permLevels.length; i++) {
				if (permLevels[i].validate(message)) userLevel = i;
			}
			if (userLevel < requiredPerms.level) {
				let faultDesc = permLevels[requiredPerms.level].desc ? permLevels[requiredPerms.level].desc : "";
				faultMsg += `\nYou need this permission level to run this command:\n${bot.permLevels[requiredPerms.level].name} (${faultDesc})`;
			}
		}
		if (faultMsg.length > 0) return message.channel.send(faultMsg);
		
		let cdCheck = cdChecker.check(bot, message, runCommand.name);
		let cdInfo = runCommand.cooldown;
		if (cdCheck == true) {
			if (runCommand.startTyping) message.channel.startTyping();
			setTimeout(() => message.channel.stopTyping(), 10000)
			let flags = [];
			if (runCommand.flags) {
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
			.catch(err => message.channel.send(`⚠ **Something went wrong with this command**\`\`\`javascript\n${err.stack}\`\`\`I am too cute to output this, so come to the official server to discuss this bug.`))
			if (runCommand.startTyping) message.channel.stopTyping();
			if (cdInfo.time != 0) {cdChecker.addCooldown(bot, message, runCommand.name)};
			/*
			This is the code if owners are to be ignored.
			
			if (!bot.ownerIds.includes(message.author.id) && runCommand.name != "help") {
				let commandUsage = bot.cache.stats.commandUsage.find(u => u.command == runCommand.name);
				if (commandUsage) {
					commandUsage.uses++;
				} else {
					bot.cache.stats.commandUsage.push({
						command: runCommand.name,
						uses: 1
					})
				}
			} else {
				bot.cache.stats.commandCurrentTotal++;
			};
			*/
			let commandUsage = bot.cache.stats.commandUsage.find(u => u.command == runCommand.name);
			if (commandUsage) {
				commandUsage.uses++;
			} else {
				bot.cache.stats.commandUsage.push({
					command: runCommand.name,
					uses: 1
				})
			};
		} else {
			if (cdCheck == false) return;
			let cdMessages = [
				"You're calling me fast enough that I'm getting dizzy!",
				"Watch out, seems like we might get a speeding ticket at this rate!",
				"You have to wait before using the command again...",
				"You're calling me a bit too fast, I am getting dizzy!",
				"I am busy, try again after a bit",
				"Hang in there before using this command again..."
			];
			let toSend = `⛔ **Cooldown:**\n*${cdMessages[Math.floor(Math.random() * cdMessages.length)]}*\nThis command cannot be used again for **${cdCheck} seconds**`
			if (cdInfo.type == "channel") {
				toSend += " in this channel"
			} else if (cdInfo.type == "guild") {
				toSend += " in this guild"
			}
			message.channel.send(`${toSend}!`);
		}
	}
}