const Discord = require("discord.js");
const request = require("request");
const config = require("../config.json");
const {version} = require("../package.json");

module.exports = async bot => {
	console.log(`Bot started successfully on ${new Date()}`);
	
	bot.mentionPrefix = new RegExp(`^<@!?${bot.user.id}>`);
	bot.user.setActivity(`k,help | with you in ${bot.guilds.size} servers`);
	bot.cache.guildCount = bot.guilds.size;
	bot.cache.userCount = bot.users.size;
	
	setInterval(() => {
		let newBotGame;
		if (Math.random() < 0.5 && bot.cache.status.randomIters < 2) {
			bot.cache.status.randomIters++;
			newBotGame = config.customStatusMessages[Math.floor(Math.random() * config.customStatusMessages.length)];
		} else {
			bot.cache.status.randomIters = 0;
			newBotGame = `with you in ${bot.cache.guildCount} servers`;
			switch (bot.cache.status.pos) {
				case 0:
					newBotGame = `with ${bot.cache.userCount} users`;
					bot.cache.status.pos++;
					break;
				case 1:
					newBotGame = `on version ${version}`;
					bot.cache.status.pos++;
					break;
				case 2:
					bot.cache.status.pos = 0;
			}
		}
		bot.user.setActivity(`k,help | ${newBotGame}`);
	}, 1000*150)
	setInterval(() => {
		bot.cache.guildCount = bot.guilds.size;
		bot.cache.userCount = bot.users.size;
	}, 1000*900)
	setInterval(bot.logStats, 1000*7200)
	
	if (config.botsDiscordPwToken) {
		setInterval(bot.postBotsDiscordPwStats, 1000*7200)
	}
	if (config.discordBotsOrgToken) {
		setInterval(bot.postDiscordBotsOrgStats, 1000*7200)
	}
};