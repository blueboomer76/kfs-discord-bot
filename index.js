const {DiscordAPIError} = require("discord.js"),
	KFSDiscordBot = require("./bot.js"),
	{token} = require("./config.json"),
	fs = require("fs");

// Check system requirements
if (parseInt(process.versions.node) < 12) {
	throw new Error("Incompatible Node.js version: v12 or newer required");
}
if (process.arch == "ia32") {
	throw new Error("Incompatible operating system: 64-bit required");
}

const bot = new KFSDiscordBot({
	disableMentions: "everyone"
});

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
	} catch (err2) {
		storedStats.commandUsages = {};
	}
} catch (err) {
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

bot.loadCommands();
if (fs.existsSync("./commands/advanced")) bot.loadCommands("./commands/advanced/");
bot.loadEvents();

process.on("uncaughtException", err => {
	console.error(`[${new Date().toJSON()}] Exception:\n` + err.stack);
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
process.on("SIGINT", () => process.exit());

process.on("exit", () => {
	console.log("Process exiting, bot stats will be logged and bot instance will be destroyed.");
	bot.logStats(true);
});

(async function() {
	let loginInterval = 1000;
	let loginDone = false;
	while (loginInterval <= 512000 && !loginDone) {
		loginDone = await bot.login(token)
			.then(() => true)
			.catch(async err => {
				console.error(`[${new Date().toJSON()}] Bot failed to login:`);
				console.error(err);

				console.log("The login will be retried in " + loginInterval / 1000 + " seconds (maximum 512).");
				await new Promise(resolve => setTimeout(resolve, loginInterval));

				loginInterval *= 2;
				return false;
			});
	}

	if (!loginDone) process.exit();
})();
