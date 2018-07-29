const Discord = require("discord.js");
const config = require("../config.json");
const argParser = require("../utils/argsParser.js");

var recentCmds = {"ids": [], "commands": [], "expires": []}

function checkCooldown(bot, message, command) {
	let ccIndex = findCooldown(getCdByType(bot, message, command), command);
	if (ccIndex == -1) {
		return true;
	} else {
		let cdDif = recentCmds.expires[ccIndex] - Number(new Date());
		return Math.round(cdDif / 100) / 10
	}
}

function getCdByType(bot, message, command) {
	let cdType = bot.commands.get(command).commandInfo.cooldown.type;
	if (cdType == "user") {
		return message.author.id
	} else if (cdType == "channel") {
		return message.channel.id
	} else if (cdType == "guild") {
		return message.guild.id
	}
}

function findCooldown(id, command) {
	let cdiArray = recentCmds.ids;
	let cdcArray = recentCmds.commands;
	let cdIndex = cdiArray.indexOf(id);
	let sliced = 0;
	while (cdIndex != cdcArray.indexOf(command) && cdiArray.indexOf(id) != -1) {
		cdIndex = cdiArray.indexOf(id);
		cdiArray.splice(cdIndex, 1);
		cdcArray.splice(cdIndex, 1);
		sliced++;
	}
	return cdIndex + sliced;
}

function addCooldown(bot, message, command) {
	let cdId = getCdByType(bot, message, command);
	let cdTime = bot.commands.get(command).cooldown.time;
	recentCmds.ids.push(cdId);
	recentCmds.commands.push(command);
	recentCmds.expires.push(Number(new Date()) + cdTime);
	bot.setTimeout(removeCooldown, cdTime, cdId, command)
}

function removeCooldown(id, command) {
	let idIndex = findCooldown(id, command);
	recentCmds.ids.splice(idIndex, 1);
	recentCmds.commands.splice(idIndex, 1);
	recentCmds.expires.splice(idIndex, 1);
}

module.exports = async (bot, message) => {
	if (message.author.bot) return; 
	let prefixMention = new RegExp(`^<@!?${bot.user.id}>`);
	if (!message.content.startsWith(config.prefix) && !message.content.match(prefixMention)) {
		if (bot.phoneVars.channels.length > 1 && bot.phoneVars.channels.indexOf(message.channel.id) != -1) {
			if (bot.phoneVars.callExpires > Number(new Date())) {
				bot.phoneVars.callExpires = Number(new Date()) + 600000;
				bot.phoneVars.msgCount++;
				setTimeout(() => {bot.phoneVars.msgCount--;}, 5000);
				let affected = 0;
				if (message.channel.id == bot.phoneVars.channels[0]) {affected = 1};
				bot.channels.get(bot.phoneVars.channels[affected]).send(":telephone_receiver: " + message.content);
				if (bot.phoneVars.msgCount > 4) {
					let phoneMsg = "☎️ The phone connection was cut off due to being overloaded."
					bot.channels.get(bot.phoneVars.channels[0]).send(phoneMsg);
					bot.channels.get(bot.phoneVars.channels[1]).send(phoneMsg);
					bot.phoneVars.channels = [];
				}
			} else {
				let phoneMsg = "⏰ The phone call has timed out due to inactivity."
				bot.channels.get(bot.phoneVars.channels[0]).send(phoneMsg);
				bot.channels.get(bot.phoneVars.channels[1]).send(phoneMsg);
				bot.phoneVars.channels = [];
			}
		}
	} else {
		let prefixSliceAmt;
		prefixSliceAmt = message.mentions.users.first() == bot.user ? 21 : config.prefix.length;
		var args = message.content.slice(prefixSliceAmt).trim().split(/ +/g);
		var command = args.shift().toLowerCase();
		var runCommand = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
		if (runCommand) {
			let info = runCommand.commandInfo;
			if (!message.guild && info.guildOnly == true) return message.channel.send("This command cannot be used in Direct Messages.")
			let requiredPerms = info.perms;
			if (message.channel.type != "dm" && (requiredPerms.bot || requiredPerms.user)) {
				let allowed = {state: true, faultMsg: null};
				if (!message.member.hasPermission(requiredPerms.user[0])) {allowed.state = false; allowed.faultMsg = "You are"}
				if (!message.guild.member(bot.user).hasPermission(requiredPerms.bot[0])) {allowed.state = false; allowed.faultMsg = "I, the bot, is"}
				if (allowed.state == false) {
					return message.channel.send(allowed.faultMsg + " missing the following permission to run this command: `" + requiredPerms + "`")
				}
			};
			let cdCheck = checkCooldown(bot, message, info.name);
			let cdInfo = info.cooldown;
			if (cdCheck == true) {
				let flags, unparsedFlags;
				if (info.flags) {
					unparsedFlags = argParser.getFlags(args);
					flags = argParser.parseFlags(bot, message, unparsedFlags.flags, info.flags)
					args = argParser.parseArgs(bot, message, unparsedFlags.newArgs, info.args);
				} else {
					args = argParser.parseArgs(bot, message, args, info.args);
				}
				if (flags.error) {
					return message.channel.send(flags.message);
				} else if (args.error) {
					return message.channel.send(args.message);
				}
				runCommand.run(bot, message, args, flags)
				.catch(err => message.channel.send("An error occurred while trying to execute the command code. ```javascript" + "\n" + err.stack + "```"));
				if (cdInfo.time != 0) {addCooldown(bot, message, info.name)};
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