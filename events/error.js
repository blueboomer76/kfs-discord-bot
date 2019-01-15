module.exports = async (bot, error) => {
	console.log("The client has encountered a connection error:");
	console.error(error);
	console.log("The bot will shut down and bot data will be logged.");
	
	bot.logStats();
	process.exit(2);
};