const Discord = require("discord.js");
const config = require("../config.json");

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
	let cdType = bot.commands.get(command).config.cooldown.type;
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
	let cdTime = bot.commands.get(command).config.cooldown.waitTime;
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
	if (message.author.bot || (!message.content.startsWith(config.prefix) && message.mentions.users.first() != bot.user)) return;
	var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	var command = args.shift().toLowerCase();
	var rCommand = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
	if (rCommand) {
		if (!message.guild && rCommand.config.guildOnly == true) return message.channel.send("This command cannot be used in Direct Messages.")
		let cmdReqPerms = rCommand.config.perms.reqPerms
		if (message.channel.type != "dm" && cmdReqPerms) {
			let allowed = {state: true, faultMsg: null};
			if (!message.member.hasPermission(cmdReqPerms)) {allowed.state = false; allowed.faultMsg = "You are"}
			if (!message.guild.member(bot.user).hasPermission(cmdReqPerms)) {allowed.state = false; allowed.faultMsg = "I, the bot, is"}
			if (allowed.state == false) {
				return message.channel.send(allowed.faultMsg + " missing the following permission to run this command: `" + cmdReqPerms + "`")
			}
		};
		let cdCheck = checkCooldown(bot, message, rCommand.help.name);
		let cdInfo = bot.commands.get(rCommand.help.name).config.cooldown;
		if (cdCheck == true) {
			rCommand.run(bot, message, args)
			.catch(err => message.channel.send("An error occurred while trying to execute the command code. ```javascript" + "\n" + err.stack + "```"));
			if (cdInfo.waitTime != 0) {addCooldown(bot, message, rCommand.help.name)};
		} else {
			let cdSuffix = "";
			if (cdInfo.type == "channel") {
				cdSuffix = " in this channel"
			} else if (cdInfo.type == "guild") {
				cdSuffix = " in this guild"
			}
			message.channel.send(":no_entry: **Cooldown:**\nThis command cannot be used again for " + cdCheck + " seconds" + cdSuffix + "!")
		}
	};
}