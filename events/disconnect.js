module.exports = async (bot, ev) => {
	console.log("The client has disconnected:");
	console.error(ev);
	console.log("The bot will shut down and bot data will be logged.");
	
	bot.logStats();
	process.exit(2);
};