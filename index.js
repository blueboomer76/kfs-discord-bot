const Discord = require("discord.js");
const KendraBot = require("./bot.js");
const {token} = require("./config.json");

const bot = new KendraBot({
	disableEveryone: true,
	disabledEvents: [
		"GUILD_MEMBERS_CHUNK",
		"USER_NOTE_UPDATE",
		"USER_SETTINGS_UPDATE"
	]
});

bot.loadCommands();
bot.loadEvents();

process.on("uncaughtException", err => {
	console.error(`[Exception]\n${new Date()}\n${err.stack}`);
	// process.exit(1);
});

process.on("unhandledRejection", (err, promise) => {
	console.log(`At ${new Date()}:`)
	console.debug(promise);
});

bot.login(token);