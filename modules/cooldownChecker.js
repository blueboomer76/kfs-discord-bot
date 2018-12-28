const cdMessages = [
	"You're calling me fast enough that I'm getting dizzy!",
	"You have to wait before using the command again...",
	"You're calling me a bit too fast, I am getting dizzy!",
	"I am busy, try again after a bit",
	"Hang in there before using this command again...",
	"Wait up, I am not done with my break"
];

function getIDByType(bot, message, commandName) {
	const cdType = bot.commands.get(commandName).cooldown.type;
	if (cdType == "user") {
		return message.author.id;
	} else if (cdType == "channel") {
		return message.channel.id;
	} else if (cdType == "guild") {
		if (message.guild) {return message.guild.id} else {return message.author.id}
	} else {
		throw new Error("Cooldown type must either be user, channel, or guild.");
	}
}

function findCooldown(bot, id, commandName, findIndex) {
	const filter = cd => cd.id == id && cd.command == commandName;
	if (findIndex) {
		return bot.cache.recentCommands.findIndex(filter);
	} else {
		return bot.cache.recentCommands.find(filter)
	}
}

function addCooldown(bot, message, commandName, overrides) {
	let cdID = getIDByType(bot, message, commandName);
	let cdTime;
	if (overrides) {
		cdTime = overrides.time;
	} else {
		cdTime = bot.commands.get(commandName).cooldown.time;
	}
	bot.cache.recentCommands.push({
		id: cdID,
		command: commandName,
		resets: Number(new Date()) + cdTime,
		notified: false
	})
	setTimeout(removeCooldown, cdTime, bot, cdID, commandName);
}

function removeCooldown(bot, id, commandName) {
	bot.cache.recentCommands.splice(findCooldown(bot, id, commandName, true), 1);
}

module.exports = {
	check: (bot, message, command) => {
		const checkedCd = findCooldown(bot, getIDByType(bot, message, command.name), command.name, false);
		if (checkedCd) {
			if (!checkedCd.notified) {
				checkedCd.notified = true;
				let toSend = `⛔ **Cooldown:**\n*${cdMessages[Math.floor(Math.random() * cdMessages.length)]}*` + "\n" +
				`This command cannot be used again for **${((checkedCd.resets - Number(new Date())) / 1000).toFixed(1)} seconds**`
				if (command.cooldown.type == "channel") {
					toSend += " in this channel";
				} else if (command.cooldown.type == "guild") {
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
