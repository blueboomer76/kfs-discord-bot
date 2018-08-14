module.exports = {
	check: (bot, message, command) => {
		let checkIndex = findCooldown(bot, getCdByType(bot, message, command), command);
		if (checkIndex == -1) {
			return true;
		} else {
			let cdDif = bot.cache.recentCommands[checkIndex].resets - Number(new Date());
			return (cdDif / 1000).toFixed(1);
		}
	},
	addCooldown: (bot, message, command) => {
		let cdId = getCdByType(bot, message, command);
		let cdTime = bot.commands.get(command).cooldown.time;
		bot.cache.recentCommands.push({
			id: cdId,
			command: command,
			resets: Number(new Date()) + cdTime
		})
		setTimeout(removeCooldown, cdTime, bot, cdId, command);
	}
}

function getCdByType(bot, message, command) {
	let cdType = bot.commands.get(command).cooldown.type;
	if (cdType == "user") {
		return message.author.id
	} else if (cdType == "channel") {
		return message.channel.id
	} else if (cdType == "guild") {
		return message.guild.id
	} else {
		throw new Error("Cooldown type must either be user, channel, or guild.")
	}
}

function findCooldown(bot, id, command) {
	let cdIndex = bot.cache.recentCommands.findIndex(cd => cd.id == id && cd.command == command);
	return cdIndex;
}

function removeCooldown(bot, id, command) {
	let idIndex = findCooldown(bot, id, command);
	bot.cache.recentCommands.splice(idIndex, 1);
}