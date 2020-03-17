module.exports = (bot, guild) => {
	if (guild.available) {
		console.log(`This bot has left ${guild.name} (${guild.id})`);
	} else {
		bot.unavailableGuildIDs.push(guild.id);
	}
};
