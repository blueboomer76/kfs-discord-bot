const Discord = require("discord.js");
const config = require("../config.json");
const {version} = require("../package.json");
const request = require("request");

module.exports = async bot => {
	console.log(`Bot started successfully on ${new Date()}`);
	bot.mentionPrefix = new RegExp(`^<@!?${bot.user.id}>`);
	bot.user.setActivity(`k,help | with you in ${bot.guilds.size} servers`);
	bot.cache.guildCount = bot.guilds.size;
	bot.cache.userCount = bot.users.size;
	setInterval(() => {
		let newBotGame = `with you in ${bot.cache.guildCount} servers`;
		switch (bot.cache.statusNum) {
			case 0:
				newBotGame = `with ${bot.cache.userCount} users`;
				bot.cache.statusNum++;
				break;
			case 1:
				newBotGame = `on version ${version}`;
				bot.cache.statusNum++;
				break;
			case 2:
				newBotGame = config.customStatusMessages[Math.floor(Math.random() * config.customStatusMessages.length)];
				bot.cache.statusNum++;
				break;
			case 3:
				bot.cache.statusNum = 0;
		}
		bot.user.setActivity(`k,help | ${newBotGame}`);
	}, 1000*120)
	setInterval(() => {
		bot.cache.guildCount = bot.guilds.size;
		bot.cache.userCount = bot.users.size;
	}, 1000*900)
	setInterval(() => {bot.logStats();}, 1000*7100)
	
	if (config.botsDiscordPwToken) {
		setInterval(() => {
			request.post({
				url: `https://bots.discord.pw/api/bots/${bot.user.id}/stats`,
				headers: {
					"Authorization": config.botsDiscordPwToken
				},
				qs: {"server_count": bot.guilds.size}
			}, (err, res) => {
				if (!err) {
					console.log("Stats successfully posted to bots.discord.pw")
				} else {
					console.log(`Failed to post to bots.discord.pw:\n${err}`)
				}
			})
		}, 1000*7200)
	}
	if (config.discordBotsOrgToken) {
		setInterval(() => {
			request.post({
				url: `https://discordbots.org/api/bots/${bot.user.id}/stats`,
				headers: {
					"Authorization": config.discordBotsOrgToken
				},
				qs: {"server_count": bot.guilds.size}
			}, (err, res) => {
				if (!err) {
					console.log("Stats successfully posted to discordbots.org")
				} else {
					console.log(`Failed to post to discordbots.org:\n${err}`)
				}
			})
		}, 1000*7200)
	}
};