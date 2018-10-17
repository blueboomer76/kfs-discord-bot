const Discord = require("discord.js");
const KendraBot = require("./bot.js");
const {token} = require("./config.json");

if (parseFloat(process.versions.node) < 8) {
	throw new Error("Incompatible Node version (Node version 8 or higher needed)");
}

// Check for modules/stats.json

try {
	require("./modules/stats.json")
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
	console.error(`[Exception]\n${new Date()}\n${err.stack}`);
	if (!bot.user) process.exit(2);
});

process.on("unhandledRejection", (err, promise) => {
	console.log(`At ${new Date()}:`)
	console.error(promise);
});

bot.login(token);