module.exports = async (bot, error) => {
	const currentTimestamp = Date.now();
	if (bot.downtimeTimestampBase == null) {
		bot.downtimeTimestampBase = currentTimestamp;
		console.error(`[${new Date().toJSON()}] WebSocket has encountered a connection error:`);
		console.error(error);
	} else {
		console.error(`[${new Date().toJSON()}] WebSocket failed to reconnect: ` + error.message);
		if (currentTimestamp - bot.downtimeTimestampBase > 600000) {
			console.error("The bot was unable to reconnect within 10 minutes.");
			process.exit();
		}
	}
};
