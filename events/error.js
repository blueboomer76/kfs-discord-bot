module.exports = async (bot, error) => {
	console.log(`[${new Date().toJSON()}] WebSocket has encountered a connection error:`);
	console.error(error);
	
	setTimeout(async () => {
		if (bot.ws.connection.ws.readyState >= 2) {
			console.log("The bot was unable to reconnect within 5 minutes; the process will exit and bot data will be logged.");
			await bot.logStats();
			process.exit(1);
		}
	}, 1000 * 300);
};
