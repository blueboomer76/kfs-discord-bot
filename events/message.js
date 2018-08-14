const Discord = require("discord.js");
const config = require("../config.json");
const argParser = require("../utils/argsParser.js");
const cdChecker = require("../modules/cooldownChecker.js");

module.exports = async (bot, message) => {
	bot.cache.messages.currentCount++;
	if (message.author.bot) return;
	if (!message.content.startsWith(config.prefix) && message.mentions.users.first() != bot.user) {
		if (bot.cache.phone.channels.length > 1 && bot.cache.phone.channels.indexOf(message.channel.id) != -1) {
			bot.handlePhoneMessage(message);
		}
	} else {
		let prefixSliceAmt;
		prefixSliceAmt = message.mentions.users.first() == bot.user ? 21 : config.prefix.length;
		let args = message.content.slice(prefixSliceAmt).trim().split(/ +/g);
		let command = args.shift().toLowerCase();
		let runCommand = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
		if (runCommand) {
			if (!message.guild && runCommand.guildOnly) return message.channel.send("This command cannot be used in Direct Messages.")
			let requiredPerms = runCommand.perms;
			if (requiredPerms && message.channel.type != "dm" && (requiredPerms.bot.length > 0 || requiredPerms.user.length > 0 || requiredPerms.level > 0)) {
				let allowed = {state: true, faultMsg: ""};
				if (requiredPerms.user.length > 0) {
					for (const perm of requiredPerms.user) {
						if (!message.member.hasPermission(perm)) {
							allowed.state = false;
							allowed.faultMsg += "You need these permissions to run this command:\n" + requiredPerms.user.join(", ")
						}
					}
				}
				if (requiredPerms.level > 0) {
					let permLevels = bot.cache.permLevels;
					let userLevel = 0;
					for (let i = 0; i < permLevels.length; i++) {
						if (permLevels[i].validate(message)) userLevel = i;
					}
					if ((requiredPerms.level == 2 || requiredPerms.level > 3) && userLevel < requiredPerms.level) {
						allowed.state = false;
						let faultDesc = permLevels[requiredPerms.level].desc ? permLevels[requiredPerms.level].desc : "";
						allowed.faultMsg += "\nYou need this permission level to run this command:\n" + bot.cache.permLevels[requiredPerms.level].name + " (" + faultDesc + ")";
					}
				}
				if (requiredPerms.bot.length > 0) {
					for (const perm of requiredPerms.bot) {
						if (!message.guild.member(bot.user).hasPermission(perm)) {
							allowed.state = false;
							allowed.faultMsg += "\nI need these permissions to run this command:\n" + requiredPerms.bot.join(", ")
						}
					}
				}
				if (!allowed.state) {
					return message.channel.send(allowed.faultMsg)
				}
			};
			let cdCheck = cdChecker.check(bot, message, runCommand.name);
			let cdInfo = runCommand.cooldown;
			if (cdCheck == true) {
				let flags = [];
				if (runCommand.flags) {
					let parsedFlags = argParser.parseFlags(bot, message, args, runCommand.flags);
					flags = parsedFlags.flags;
					args = parsedFlags.newArgs;
				}
				args = argParser.parseArgs(bot, message, args, runCommand.args);
				if (flags.error) {
					return message.channel.send(flags.message);
				} else if (args.error) {
					return message.channel.send(args.message);
				}
				runCommand.run(bot, message, args, flags)
				.catch(err => {
					message.channel.send("🤷 I was unable to execute the command because: ```javascript" + "\n" + err.stack + "```Come to the official server to discuss this bug.")
				});
				if (cdInfo.time != 0) {cdChecker.addCooldown(bot, message, runCommand.name)};
				let commandUsage = bot.cache.usage.find(u => u.command == runCommand.name);
				if (commandUsage) {
					commandUsage.uses++;
				} else {
					bot.cache.usage.push({
						command: runCommand.name,
						uses: 1
					})
				}
			} else {
				let cdSuffix = "";
				if (cdInfo.type == "channel") {
					cdSuffix = " in this channel"
				} else if (cdInfo.type == "guild") {
					cdSuffix = " in this guild"
				}
				message.channel.send("⛔ **Cooldown:**\nThis command cannot be used again for " + cdCheck + " seconds" + cdSuffix + "!")
			}
		}
	}
}