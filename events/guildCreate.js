module.exports = (bot, guild) => {
	if (!bot.unavailableGuildIDs.includes(guild.id)) {
		console.log(`This bot has joined ${guild.name} (${guild.id}), which has ${guild.memberCount} members.`);
	} else {
		bot.unavailableGuildIDs.splice(bot.unavailableGuildIDs.indexOf(guild.id), 1);
	}
};
