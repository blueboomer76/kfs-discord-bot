const Discord = require("discord.js");
const {version} = require("../package.json");
const request = require("request");

module.exports = async bot => {
	console.log("Bot started successfully on " + new Date());
	bot.user.setActivity(`k,help | with you in ${bot.guilds.size} servers`);
	bot.cache.guildCount = bot.guilds.size;
	bot.cache.userCount = bot.users.size;
	setInterval(() => {
		let botGame = bot.user.presence.game.name;
		let newBotGame = `with you in ${bot.cache.guildCount} servers`
		if (botGame.endsWith("servers")) {
			newBotGame = `with ${bot.cache.userCount} users`
		} else if (botGame.endsWith("users")) {
			newBotGame = `on version ${version}`
		}
		bot.user.setActivity(`k,help | ${newBotGame}`);
	}, 1000*120)
	setInterval(() => {
		bot.cache.guildCount = bot.guilds.size;
		bot.cache.userCount = bot.users.size;
	}, 1000*900)
	setInterval(() => {bot.logStats();}, 1000*7100)
};