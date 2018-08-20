const KFSDiscordBot = require("./bot.js");
const {token} = require("./config.json");

let storedStats;
try {
	storedStats = require("./modules/stats.json");
	if (isNaN(parseInt(storedStats.duration))) storedStats.duration = 0;
	if (isNaN(parseInt(storedStats.commandTotal))) storedStats.commandTotal = 0;
	if (isNaN(parseInt(storedStats.messageTotal))) storedStats.messageTotal = 0;
	try {
		storedStats.commandUsages = storedStats.commandUsages.filter(entry => {
			return !isNaN(parseInt(entry.uses));
		});
	} catch (err2) {
		storedStats.commandUsages = [];
	}
} catch (err) {
	storedStats = {
		duration: 0,
		commandTotal: 0,
		messageTotal: 0,
		commandUsages: []
	}
}

require("fs").writeFile("modules/stats.json", JSON.stringify(storedStats, null, 4), err => {
	if (err) throw err;
})

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
