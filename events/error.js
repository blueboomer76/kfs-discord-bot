module.exports = async (bot, error) => {
	console.error("The client has encountered a connection error:");
	console.error(error);
	console.log("The bot will shut down and bot data will be logged.");

	await bot.logStats();
	process.exit(1);
};
