const {version} = require("../package.json");
const {prefix} = require("../config.json");

module.exports = async bot => {
	console.log("Bot started successfully on " + new Date());
	bot.user.setActivity(prefix + "help | with you in " + bot.guilds.size + " servers");
	bot.cache.guildCount = bot.guilds.size;
	bot.cache.userCount = bot.users.size;
	bot.mentionPrefix = new RegExp(`^<@!?${bot.user.id}>`);
	setInterval(() => {
		let botGame = bot.user.presence.game.name;
		let newBotGame;
		if (botGame.endsWith("servers")) {
			newBotGame = "with " + bot.cache.userCount + " users";
		} else if (botGame.endsWith("users")) {
			newBotGame = "on version " + version;
		} else {
			newBotGame = "with you in " + bot.cache.guildCount + " servers";
			bot.cache.guildCount = bot.guilds.size;
			bot.cache.userCount = bot.users.size;
		}
		bot.user.setActivity(prefix + "help | " + newBotGame);
	}, 1000 * 180)
};
