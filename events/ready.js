const config = require("../config.json");
const {version} = require("../package.json");
const request = require("request");

module.exports = async bot => {
	console.log(`Bot started successfully on ${new Date()}`);
	bot.user.setActivity(`${bot.prefix}help | with you in ${bot.guilds.size} servers`);
	bot.cache.guildCount = bot.guilds.size;
	bot.cache.userCount = bot.users.size;
	bot.mentionPrefix = new RegExp(`^<@!?${bot.user.id}>`);
	setInterval(() => {
		let newBotGame;
		let statusNum = bot.cache.statusNum;
		switch (statusNum) {
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
				newBotGame = `with you in ${bot.cache.guildCount} servers`;
				bot.cache.statusNum = 0;
				bot.cache.guildCount = bot.guilds.size;
				bot.cache.userCount = bot.users.size;
		}
		bot.user.setActivity(`${bot.prefix}help | ${newBotGame}`);
	}, 1000 * 180)
	setInterval(() => {bot.logStats()}, 1000 * 7200);
	if (config.botsDiscordPwToken) {
		setInterval(() => {
			request.post({
				url: `https://bots.discord.pw/api/bots/${bot.user.id}/stats`,
				headers: {
					"Authorization": config.botsDiscordPwToken
				},
				body: {"server_count": bot.guilds.size},
				json: true
			}, (err, res) => {
				if (err) {
					console.log(`[Stats Posting] Could not request to bots.discord.pw: ${err.message}`);
				} else if (!res) {
					console.log("[Stats Posting] No response was received from bots.discord.pw.");
				} else if (res.statusCode >= 400) {
					console.log(`[Stats Posting] The request to bots.discord.pw failed with status code ${res.statusCode} (${res.statusMessage})`);
				} else {
					console.log("[Stats Posting] Stats successfully posted to bots.discord.pw");
				}
			})
		}, 1000 * 7200);
	}
	if (config.discordBotsOrgToken) {
		setInterval(() => {
			request.post({
				url: `https://discordbots.org/api/bots/${bot.user.id}/stats`,
				headers: {
					"Authorization": config.discordBotsOrgToken
				},
				body: {"server_count": bot.guilds.size},
				json: true
			}, (err, res) => {
				if (err) {
					console.log(`[Stats Posting] Could not request to discordbots.org: ${err.message}`);
				} else if (!res) {
					console.log("[Stats Posting] No response was received from discordbots.org.");
				} else if (res.statusCode >= 400) {
					console.log(`[Stats Posting] The request to discordbots.org failed with status code ${res.statusCode} (${res.statusMessage})`);
				} else {
					console.log("[Stats Posting] Stats successfully posted to discordbots.org");
				}
			})
		}, 1000 * 7200);
	}
};
