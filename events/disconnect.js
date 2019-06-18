module.exports = async (bot, event) => {
	console.error(`[${new Date().toJSON()}] WebSocket client has disconnected:`);
	console.error(event);
	console.log("The bot will shut down and bot data will be logged.");
	
	await bot.logStats(true);
	process.exit(2);
};