const {customCooldownMessages} = require("../config.json"),
	{capitalize} = require("../modules/functions.js");

function getIdByType(message, type) {
	if (type == "user") {
		return message.author.id;
	} else if (type == "channel") {
		return message.channel.id;
	} else if (type == "guild") {
		return (message.guild && message.guild.id) || message.author.id;
	} else {
		throw new Error("Cooldown type must either be user, channel, or guild.");
	}
}

function findCooldown(bot, id, name, findIndex) {
	const filter = cd => cd.id == id && cd.name == name;
	return findIndex ? bot.cache.recentCommands.findIndex(filter) : bot.cache.recentCommands.find(filter);
}

/*
	Overrides are structured like this:
	{
		name: "image",
		time: 60000,
		type: "channel"
	}
*/
function addCooldown(bot, message, command, overrides) {
	if (!overrides) overrides = {};
	const cdName = overrides.name || command.name,
		cdTime = overrides.time || command.cooldown.time,
		cdId = getIdByType(message, overrides.type || command.cooldown.type);

	bot.cache.recentCommands.push({
		id: cdId,
		name: cdName,
		resets: Date.now() + cdTime,
		notified: false
	});
	setTimeout(removeCooldown, cdTime, bot, cdId, cdName);
}

function removeCooldown(bot, id, name) {
	bot.cache.recentCommands.splice(findCooldown(bot, id, name, true), 1);
}

module.exports = {
	check: (bot, message, command) => {
		const cdType = command.cooldown.type,
			checkedCd = findCooldown(bot, getIdByType(message, cdType), command.cooldown.name || command.name, false);
		if (checkedCd) {
			if (!checkedCd.notified) {
				checkedCd.notified = true;
				let toSend = `⛔ **Cooldown:**\n*${customCooldownMessages[Math.floor(Math.random() * customCooldownMessages.length)]}*` + "\n";
				toSend += command.cooldown.name ? `${capitalize(command.cooldown.name, true)} commands are` : "This command is";

				const cdTime = ((checkedCd.resets - Date.now()) / 1000).toFixed(1);
				toSend += ` on cooldown for **${cdTime > 0 ? cdTime : 0.1} more seconds**`;
				if (cdType == "channel") {
					toSend += " in this channel";
				} else if (cdType == "guild") {
					toSend += " in this guild";
				}
				message.channel.send(`${toSend}!`);
			}
			return false;
		} else {
			return true;
		}
	},
	addCooldown: addCooldown
};