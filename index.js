const KFSDiscordBot = require("./bot.js"),
	{token} = require("./config.json");

if (parseFloat(process.versions.node) < 8) {
	throw new Error("Incompatible Node version (Node version 8 or higher needed)");
}

let storedStats;
try {
	storedStats = require("./modules/stats.json");
	if (isNaN(parseInt(storedStats.duration))) storedStats.duration = 0;
	if (isNaN(parseInt(storedStats.commandTotal))) storedStats.commandTotal = 0;
	if (isNaN(parseInt(storedStats.callTotal))) storedStats.callTotal = 0;
	if (isNaN(parseInt(storedStats.messageTotal))) storedStats.messageTotal = 0;
	try {
		storedStats.commandUsages = storedStats.commandUsages.filter(entry => {
			return !isNaN(parseInt(entry.uses));
		});
	} catch(err2) {
		storedStats.commandUsages = [];
	}
} catch(err) {
	storedStats = {
		duration: 0,
		commandTotal: 0,
		callTotal: 0,
		messageTotal: 0,
		commandUsages: []
	};
}

require("fs").writeFile("modules/stats.json", JSON.stringify(storedStats, null, 4), err => {
	if (err) throw err;
});

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
	console.error(`[Exception] ${new Date()}:` + "\n" + err.stack);
	if (!bot.user) process.exit(1);
});

process.on("unhandledRejection", reason => {
	const reasonStack = reason instanceof Error && reason.stack ? reason.stack : reason;
	console.error(`[Promise Rejection] ${new Date()}:` + "\n" + reasonStack);
});

// Emitted by Ctrl+C in the command line
process.on("SIGINT", async () => {
	console.log("Logging stats and exiting process due to a SIGINT received");
	await bot.logStats();
	process.exit(1);
});

bot.login(token);
