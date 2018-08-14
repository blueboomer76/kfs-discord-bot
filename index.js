const KFSDiscordBot = require("./bot.js");
const {token} = require("./config.json");

const bot = new KFSDiscordBot({
	disableEveryone: true,
	disabledEvents: [
		"USER_NOTE_UPDATE",
		"USER_SETTINGS_UPDATE"
	]
});

bot.loadCommands();
bot.loadEvents();

process.on("uncaughtException", err => {
	console.error(`[Exception] ${new Date()}:`)
	console.error(err.stack);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error(`[Promise Rejection] ${new Date()}:`)
	console.error(promise);
});

bot.login(token);
