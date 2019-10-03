const KendraBot = require("./bot.js"),
	{token} = require("./config.json"),
	fs = require("fs");

// Check system requirements
if (parseInt(process.versions.node) < 8) {
	throw new Error("Incompatible Node.js version: v8 or newer required");
}
if (process.arch == "ia32") {
	throw new Error("Incompatible operating system: 64-bit required");
}

// Check for modules/stats.json
if (!fs.existsSync("modules/stats.json")) {
	fs.writeFileSync("modules/stats.json", JSON.stringify({
		duration: 0,
		messageTotal: 0,
		commandTotal: 0,
		callTotal: 0,
		lastSorted: 0,
		commandDistrib: {}
	}, null, 4));
}

const bot = new KendraBot({
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
	if (reason && reason.name == "DiscordAPIError") {
		console.error(`[${new Date().toJSON()}] Discord API has returned an error: ${reason.message}`);
		console.error(`Details - Code: ${reason.code}, Method: ${reason.method}, Path: ${reason.path}`);
	} else {
		console.error(`[${new Date().toJSON()}] Promise Rejection:`);
		console.error(reason);
	}
});

// Emitted by Ctrl+C in the command line
process.on("SIGINT", () => process.exit());

process.on("exit", () => {
	console.log("Process exiting, bot stats will be logged and bot instance will be destroyed.");
	bot.logStats(true);
});

bot.login(token)
	.catch(err => {
		console.error("Bot failed to login:");
		console.error(err);
	});