const config = require("../config.json");

var recentCmds = {"ids": [], "commands": [], "expires": []}

function checkCooldown(bot, message, command) {
	let ccIndex = findCooldown(getIDByType(bot, message, command), command);
	if (ccIndex == -1) {
		return true;
	} else {
		let cdDif = recentCmds.expires[ccIndex] - Number(new Date());
		return Math.round(cdDif / 100) / 10;
	}
}

function getIDByType(bot, message, command) {
	let idType = bot.commands.get(command).config.cooldown.type;
	if (idType == "user") {
		return message.author.id;
	} else if (idType == "channel") {
		return message.channel.id;
	} else if (idType == "guild") {
		if (message.guild) {return message.guild.id} else {return message.author.id}
	} else {
		throw new Error("Cooldown type must either be user, channel, or guild.");
	}
}

function findCooldown(id, command) {
	let i = -1;
	let currCdIndex = 0;
	let chnlCdIndex;
	while (currCdIndex < recentCmds.ids.length) {
		chnlCdIndex = recentCmds.ids.indexOf(id, currCdIndex);
		if (chnlCdIndex == recentCmds.commands.indexOf(command, currCdIndex) && chnlCdIndex != -1) {
			i = currCdIndex;
		}
		currCdIndex++;
	}
	return i;
}

function addCooldown(bot, message, command) {
	let cdID = getIDByType(bot, message, command);
	let cdTime = bot.commands.get(command).config.cooldown.waitTime;
	recentCmds.ids.push(cdID);
	recentCmds.commands.push(command);
	recentCmds.expires.push(Number(new Date()) + cdTime);
	bot.setTimeout(removeCooldown, cdTime, cdID, command)
}

function removeCooldown(id, command) {
	let idIndex = findCooldown(id, command);
	recentCmds.ids.splice(idIndex, 1);
	recentCmds.commands.splice(idIndex, 1);
	recentCmds.expires.splice(idIndex, 1);
}

module.exports = async (bot, message) => {
	if (message.author.bot) return;
	let mentionMatch = message.content.match(bot.mentionPrefix);
	if (!message.content.startsWith(config.prefix) && !mentionMatch) {
		if (bot.phoneVars.channels.length > 1 && bot.phoneVars.channels.indexOf(message.channel.id) != -1) {
			if (message.guild && !message.channel.permissionsFor(bot.user).has("SEND_MESSAGES")) return;
			if (bot.phoneVars.callExpires > Number(new Date())) {
				bot.phoneVars.callExpires = Number(new Date()) + 600000;
				bot.phoneVars.msgCount++;
				setTimeout(() => {bot.phoneVars.msgCount--;}, 5000);
				let affected = 0;
				if (message.channel.id == bot.phoneVars.channels[0]) {affected = 1};
				bot.channels.get(bot.phoneVars.channels[affected]).send(":telephone_receiver: " + message.content);
				if (bot.phoneVars.msgCount > 4) {
					let phoneMsg = "☎ The phone connection was cut off due to being overloaded."
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
		let prefixLength = mentionMatch ? mentionMatch[0].length : config.prefix.length;
		var args = message.content.slice(prefixLength).trim().split(/ +/g);
		var command = args.shift().toLowerCase();
		var rCommand = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
		if (rCommand) {
			if (message.guild) {
				if (!message.channel.permissionsFor(bot.user).has("SEND_MESSAGES")) return;
				if (rCommand.config.perms.reqEmbed && !message.channel.permissionsFor(bot.user).has("EMBED_LINKS")) {
					return message.channel.send("This command requires the bot to have the `EMBED_MESSAGES` permission to post an embed.");
				}
				let cmdReqPerms = rCommand.config.perms.reqPerms;
				if (cmdReqPerms) {
					let allowed = {state: true, faultMsg: null};
					if (!message.member.hasPermission(cmdReqPerms)) {allowed.state = false; allowed.faultMsg = "You are"}
					if (!message.guild.member(bot.user).hasPermission(cmdReqPerms)) {allowed.state = false; allowed.faultMsg = "I, the bot, is"}
					if (allowed.state == false) {
						return message.channel.send(allowed.faultMsg + " missing the following permission to run this command: `" + cmdReqPerms + "`")
					}
				}
			} else if (rCommand.config.guildOnly == true) {
				return message.channel.send("This command cannot be used in Direct Messages.");
			}
			let cdInfo = rCommand.config.cooldown;
			if (cdInfo.waitTime != 0) {
				let cdCheck = checkCooldown(bot, message, rCommand.help.name);
				if (cdCheck != true) {
					let cdSuffix = "";
					if (cdInfo.type == "channel") {
						cdSuffix = " in this channel";
					} else if (cdInfo.type == "guild") {
						cdSuffix = " in this server";
					}
					return message.channel.send(":no_entry: **Cooldown:**\nThis command cannot be used again for " + cdCheck + " seconds" + cdSuffix + "!")
				}
				addCooldown(bot, message, rCommand.help.name);
			}
			rCommand.run(bot, message, args).catch(err => {
				let e = err;
				if (err && err.stack) e = err.stack;
				message.channel.send("An error has occurred while running the command:```javascript" + "\n" + e + "```");
			});
		}
	}
};
