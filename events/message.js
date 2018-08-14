const cdChecker = require("../modules/cooldownChecker.js");
const argParser = require("../utils/argsParser.js");
const config = require("../config.json");

module.exports = async (bot, message) => {
	if (message.author.bot) return;
	let mentionMatch = message.content.match(bot.mentionPrefix);
	if (!message.content.startsWith(config.prefix) && !mentionMatch) {
		if (bot.cache.phone.channels.length > 1 && bot.cache.phone.channels.indexOf(message.channel.id) != -1) {
			if (message.guild && !message.channel.permissionsFor(bot.user).has("SEND_MESSAGES")) return;
			bot.handlePhoneMessage(message);
		}
	} else {
		let prefixLength = mentionMatch ? mentionMatch[0].length : config.prefix.length;
		let args = message.content.slice(prefixLength).trim().split(/ +/g);
		let command = args.shift().toLowerCase();
		let runCommand = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
		if (runCommand) {
			if (message.guild && !message.channel.permissionsFor(bot.user).has("SEND_MESSAGES")) return;
			if (!message.guild && runCommand.guildOnly) return message.channel.send("This command cannot be used in Direct Messages.")

			let requiredPerms = runCommand.perms;
			let allowed = {state: true, faultMsg: ""};
			if (message.guild) {
				if (requiredPerms.user.length > 0) {
					for (const perm of requiredPerms.user) {
						if (!message.member.hasPermission(perm)) {
							allowed.state = false;
							allowed.faultMsg += "You need these permissions to run this command:\n" + requiredPerms.user.join(", ");
							break;
						}
					}
				}
				if (requiredPerms.bot.length > 0) {
					for (const perm of requiredPerms.bot) {
						if (!message.guild.member(bot.user).hasPermission(perm)) {
							allowed.state = false;
							allowed.faultMsg += "\nI need these permissions to run this command:\n" + requiredPerms.bot.join(", ")
							break;
						}
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
			if (!allowed.state) return message.channel.send(allowed.faultMsg);

			let cdInfo = runCommand.cooldown;
			if (cdInfo.time != 0) {
				let cdCheck = cdChecker.check(bot, message, runCommand.name);
				if (cdCheck != true) {
					let cdSuffix = "";
					if (cdInfo.type == "channel") {
						cdSuffix = " in this channel";
					} else if (cdInfo.type == "guild") {
						cdSuffix = " in this server";
					}
					return message.channel.send(":no_entry: **Cooldown:**\nThis command cannot be used again for " + cdCheck + " seconds" + cdSuffix + "!")
				}
				cdChecker.addCooldown(bot, message, runCommand.name);
			}
			let flags = [];
			if (runCommand.flags.length > 0) {
				let parsedFlags = argParser.parseFlags(bot, message, args, runCommand.flags);
				if (flags.error) {
					return message.channel.send(flags.message);
				}
				flags = parsedFlags.flags;
				args = parsedFlags.newArgs;
			}
			args = argParser.parseArgs(bot, message, args, runCommand.args);
			if (args.error) {
				return message.channel.send(args.message);
			}
			runCommand.run(bot, message, args, flags).catch(err => {
				let e = err;
				if (err && err.stack) e = err.stack;
				message.channel.send("An error has occurred while running the command:```javascript" + "\n" + e + "```");
			});
		}
	}
};
