const {Constants, DiscordAPIError, Intents} = require("discord.js"),
	KFSDiscordBot = require("./bot.js"),
	{intents, token} = require("./config.json"),
	fs = require("fs");

// Check system requirements
const nodeVersionMatch = process.versions.node.match(/^(\d+)\.(\d+)/);
if (parseInt(nodeVersionMatch[1]) < 16 || parseInt(nodeVersionMatch[2]) < 6) {
	throw new Error("Incompatible Node.js version: v16.6.0 or newer required");
}
if (process.arch == "ia32") {
	throw new Error("Incompatible operating system: 64-bit required");
}

// Intents
const parsedIntents = new Intents(["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"]);
if (Array.isArray(intents) || !isNaN(parseInt(intents))) parsedIntents.add(intents);

// Initialize the bot object
const bot = new KFSDiscordBot({
	disableMentions: "everyone",
	intents: parsedIntents
});

let storedStats;
try {
	storedStats = require("./modules/stats.json");
	if (isNaN(parseInt(storedStats.duration))) storedStats.duration = 0;
	if (isNaN(parseInt(storedStats.commandTotal))) storedStats.commandTotal = 0;
	if (isNaN(parseInt(storedStats.interactionTotal))) storedStats.interactionTotal = 0;
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
	try {
		for (const cmdName in storedStats.slashCommandUsages) {
			if (isNaN(parseInt(storedStats.slashCommandUsages[cmdName]))) {
				delete storedStats.slashCommandUsages[cmdName];
			}
		}
	} catch (err2) {
		storedStats.slashCommandUsages = {};
	}
} catch (err) {
	storedStats = {
		duration: 0,
		commandTotal: 0,
		interactionTotal: 0,
		callTotal: 0,
		messageTotal: 0,
		lastSorted: 0,
		commandUsages: {},
		slashCommandUsages: {}
	};
}

fs.writeFile("modules/stats.json", JSON.stringify(storedStats, null, 4), err => {
	if (err) throw err;
	bot.cache.cumulativeStats = require("./modules/stats.json");
});

bot.loadSlashCommands("./commands/slashCommands/");
if (fs.existsSync("./commands/slashCommandsAdvanced")) bot.loadSlashCommands("./commands/slashCommandsAdvanced/");
bot.loadEvents();

process.on("uncaughtException", err => {
	console.error(`[${new Date().toJSON()}] Exception:\n` + err.stack);
	if (!bot.user) process.exit(1);
});

process.on("unhandledRejection", reason => {
	if (reason instanceof DiscordAPIError) {
		console.error(`[${new Date().toJSON()}] Discord API has returned an error: ${reason.message}`);
		console.error(`Details - Code: ${reason.code}, Method: ${reason.method}, Path: ${reason.path}`);
		console.error(reason.requestData);
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
	const testIntents = [];
	for (const intent of new Intents(Intents.PRIVILEGED).toArray()) {
		if (parsedIntents.has(intent)) testIntents.push(intent);
	}

	let loginInterval = 1000;
	let loginDone = false;
	while (loginInterval <= 512000 && !loginDone) {
		loginDone = await bot.login(token)
			.then(() => true)
			.catch(async err => {
				console.error(`[${new Date().toJSON()}] Bot failed to login:`);
				console.error(err);

				if (err instanceof DiscordAPIError && err.code == Constants.WSCodes["4014"]) {
					const nextIntent = testIntents.pop();
					console.error(`Login failed due to intents, retrying without the ${nextIntent} intent.`);
					parsedIntents.remove(nextIntent);

					loginInterval = 1000; // Reset the login interval
				} else {
					loginInterval *= 2;
				}

				console.log("The login will be retried in " + loginInterval / 1000 + " seconds (maximum 512).");
				await new Promise(resolve => setTimeout(resolve, loginInterval));

				return false;
			});
	}

	if (!loginDone) process.exit();
})();
