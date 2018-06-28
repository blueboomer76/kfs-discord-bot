var initialized = false;

module.exports = async bot => {
	bot.user.setActivity("with you in " + bot.guilds.size + " servers");
	if (!initialized) {
		initialized = true;
		console.log("Bot started successfully on " + new Date());
	}
};
