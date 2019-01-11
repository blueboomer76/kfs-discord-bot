const {capitalize} = require("../modules/functions.js");

const cdMessages = [
	"You're calling me fast enough that I'm getting dizzy!",
	"You have to wait before using the command again...",
	"You're calling me a bit too fast, I am getting dizzy!",
	"I am busy, try again after a bit",
	"Hang in there before using this command again...",
	"Wait up, I am not done with my break"
];

function getIDByType(message, type) {
	if (type == "user") {
		return message.author.id;
	} else if (type == "channel") {
		return message.channel.id;
	} else if (type == "guild") {
		if (message.guild) {return message.guild.id} else {return message.author.id}
	} else {
		throw new Error("Cooldown type must either be user, channel, or guild.");
	}
}

function findCooldown(bot, id, name, findIndex) {
	const filter = cd => cd.id == id && cd.name == name;
	if (findIndex) {
		return bot.cache.recentCommands.findIndex(filter);
	} else {
		return bot.cache.recentCommands.find(filter)
	}
}

/*
	Overrides are structured like this:
	{
		name: "image",
		time: 60000
	}
*/
function addCooldown(bot, message, command, overrides) {
	if (!overrides) overrides = {};
	const cdID = getIDByType(message, command.cooldown.type),
		cdName = overrides.name ? overrides.name : command.name,
		cdTime = overrides.time ? overrides.time : command.cooldown.time;

	bot.cache.recentCommands.push({
		id: cdID,
		name: cdName,
		resets: Number(new Date()) + cdTime,
		notified: false
	})
	setTimeout(removeCooldown, cdTime, bot, cdID, cdName);
}

function removeCooldown(bot, id, name) {
	bot.cache.recentCommands.splice(findCooldown(bot, id, name, true), 1);
}

module.exports = {
	check: (bot, message, command) => {
		const cdType = command.cooldown.type,
			checkedCd = findCooldown(bot, getIDByType(message, cdType), command.cooldown.name ? command.cooldown.name : command.name, false);
		if (checkedCd) {
			if (!checkedCd.notified) {
				checkedCd.notified = true;
				let toSend = `⛔ **Cooldown:**\n*${cdMessages[Math.floor(Math.random() * cdMessages.length)]}*` + "\n";

				if (command.cooldown.name) {
					toSend += `${capitalize(command.cooldown.name, true)} commands`
				} else {
					toSend += "This command"
				}
				toSend += ` cannot be used again for **${((checkedCd.resets - Number(new Date())) / 1000).toFixed(1)} seconds**`
				if (cdType == "channel") {
					toSend += " in this channel";
				} else if (cdType == "guild") {
					toSend += " in this server";
				}
				message.channel.send(`${toSend}!`);
			}
			return false;
		} else {
			return true;
		}
	},
	addCooldown: addCooldown
}
