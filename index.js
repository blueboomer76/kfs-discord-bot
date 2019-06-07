const {DiscordAPIError} = require("discord.js"),
	KFSDiscordBot = require("./bot.js"),
	{token} = require("./config.json"),
	fs = require("fs");

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
	if (isNaN(parseInt(storedStats.lastSorted))) storedStats.lastSorted = 0;
	try {
		for (const cmdName in storedStats.commandUsages) {
			if (isNaN(parseInt(storedStats.commandUsages[cmdName]))) {
				delete storedStats.commandUsages[cmdName];
			}
		}
	} catch(err2) {
		storedStats.commandUsages = {};
	}
} catch(err) {
	storedStats = {
		duration: 0,
		commandTotal: 0,
		callTotal: 0,
		messageTotal: 0,
		lastSorted: 0,
		commandUsages: {}
	};
}

fs.writeFile("modules/stats.json", JSON.stringify(storedStats, null, 4), err => {
	if (err) throw err;
	bot.cache.cumulativeStats = require("./modules/stats.json");
});

const bot = new KFSDiscordBot({
	disableEveryone: true,
	disabledEvents: [
		"USER_NOTE_UPDATE",
		"USER_SETTINGS_UPDATE"
	]
});

bot.loadCommands();
if (fs.existsSync("./commands/advanced")) bot.loadCommands("./commands/advanced/");
bot.loadEvents();

process.on("uncaughtException", err => {
	console.error(`[${new Date().toJSON()}] Exception:` + "\n" + err.stack);
	if (!bot.user) process.exit(1);
});

process.on("unhandledRejection", reason => {
	if (reason instanceof DiscordAPIError) {
		console.error(`[${new Date().toJSON()}] Discord API has returned an error: ${reason.message}`);
		console.error(`Details - Code: ${reason.code}, Method: ${reason.method}, Path: ${reason.path}`);
	} else {
		console.error(`[${new Date().toJSON()}] Promise Rejection:`);
		console.error(reason);
	}
});

// Emitted by Ctrl+C in the command line
process.on("SIGINT", async () => {
	console.log("Logging stats and exiting process due to a SIGINT received");
	await bot.logStats(true);
	process.exit(1);
});

bot.login(token);
