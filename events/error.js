module.exports = async (bot, error) => {
	bot.connectionRetries++;
	if (bot.connectionRetries == 1) {
		console.error(`[${new Date().toJSON()}] WebSocket has encountered a connection error:`);
		console.error(error);
	} else {
		console.error(`[${new Date().toJSON()}] WebSocket failed to reconnect: ${error.message}`);
		if (bot.connectionRetries >= 50) {
			console.error("The bot was unable to reconnect within 50 reconnection attempts; the process will exit and bot data will be logged.");
			await bot.logStats(true);
			process.exit(1);
		}
	}
};
