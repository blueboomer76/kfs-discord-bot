const Discord = require("discord.js");
const KendraBot = require("./bot.js");
const {token} = require("./config.json");

if (parseFloat(process.versions.node) < 8) {
	throw new Error("Incompatible Node version (Node version 8 or higher needed)");
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
	if (!bot.guilds) process.exit(2);
});

process.on("unhandledRejection", (err, promise) => {
	console.log(`At ${new Date()}:`)
	console.debug(promise);
});

bot.login(token);