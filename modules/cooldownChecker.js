function getIDByType(bot, message, command) {
	let cdType = bot.commands.get(command).cooldown.type;
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

function findCooldown(bot, id, command) {
	return bot.cache.recentCommands.find(cd => cd.id == id && cd.command == command);
}

function addCooldown(bot, message, command) {
	let cdID = getIDByType(bot, message, command);
	let cdTime = bot.commands.get(command).cooldown.time;
	bot.cache.recentCommands.push({
		id: cdID,
		command: command,
		resets: Number(new Date()) + cdTime,
		notified: false
	})
	setTimeout(removeCooldown, cdTime, bot, cdID, command);
}

function removeCooldown(bot, id, command) {
	bot.cache.recentCommands.splice(findCooldown(bot, id, command), 1);
}

module.exports = {
	check: (bot, message, command) => {
		let cdType = bot.commands.get(command).cooldown.type;
		let checkedCd = findCooldown(bot, getIDByType(bot, message, command), command);
		if (checkedCd) {
			if (!checkedCd.notified) {
				checkedCd.notified = true;
				let cdMessages = [
					"You're calling me fast enough that I'm getting dizzy!",
					"You have to wait before using the command again...",
					"You're calling me a bit too fast, I am getting dizzy!",
					"I am busy, try again after a bit",
					"Hang in there before using this command again..."
				];
				let toSend = `⛔ **Cooldown:**\n*${cdMessages[Math.floor(Math.random() * cdMessages.length)]}*` + "\n" +
				`This command cannot be used again for **${((checkedCd.resets - Number(new Date())) / 1000).toFixed(1)} seconds**`
				if (message.guild) {
					if (cdType == "channel") {
						toSend += " in this channel";
					} else if (cdType == "guild") {
						toSend += " in this server";
					}
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
