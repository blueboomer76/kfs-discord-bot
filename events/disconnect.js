module.exports = async (bot, event) => {
	console.log(`[${new Date().toJSON()}] WebSocket client has disconnected:`);
	console.log(event);
	console.log("The bot will shut down and bot data will be logged.");
	
	await bot.logStats(true);
	process.exit(1);
};
