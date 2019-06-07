module.exports = (bot, error) => {
	if (!bot.hasConnError) {
		console.log(`[${new Date().toJSON()}] WebSocket has encountered a connection error:`);
		console.error(error);
	
		setTimeout(async () => {
			if (bot.ws.connection.ws.readyState >= 2) {
				console.log("The bot was unable to reconnect within 5 minutes; the process will exit and bot data will be logged.");
				await bot.logStats(true);
				process.exit(1);
			} else {
				delete bot.hasConnError;
			}
		}, 1000 * 300);
		bot.hasConnError = true;
	} else {
		console.error(`[${new Date().toJSON()}] WebSocket failed to reconnect: ${error.message}`);
	}
};
