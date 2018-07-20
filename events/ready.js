module.exports = async bot => {
	console.log("Bot started successfully on " + new Date());
	bot.user.setActivity("with you in " + bot.guilds.size + " servers");
	bot.mentionPrefix = new RegExp(`^<@!?${bot.user.id}>`);
};
