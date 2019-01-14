module.exports = async (bot, ev) => {
	console.log("The client has disconnected:");
	console.log(ev);
	console.log("The bot will shut down and bot data will be logged.");

	bot.logStats();
	setTimeout(() => process.exit(1), 10000);
};
