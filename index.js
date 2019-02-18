const KendraBot = require("./bot.js"),
	{token} = require("./config.json");

if (parseFloat(process.versions.node) < 8) {
	throw new Error("Incompatible Node version (Node version 8 or higher needed)");
}

// Check for modules/stats.json

try {
	require("./modules/stats.json");
} catch(err) {
	require("fs").writeFile("modules/stats.json", JSON.stringify({
		duration: 0,
		messageTotal: 0,
		commandTotal: 0,
		callTotal: 0,
		commandDistrib: []
	}), err => {if (err) throw err;});
}

const bot = new KendraBot({
	disableEveryone: true,
	disabledEvents: [
		"USER_NOTE_UPDATE",
		"USER_SETTINGS_UPDATE"
	]
});

bot.loadCommands();
bot.loadEvents();

process.on("uncaughtException", err => {
	console.error(`[${new Date().toJSON()}] Exception:` + "\n" + err.stack);
	if (!bot.user) process.exit(2);
});

process.on("unhandledRejection", reason => {
	if (reason && reason.name == "DiscordAPIError") {
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
	await bot.logStats();
	process.exit(1);
});

bot.login(token);