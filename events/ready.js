const config = require("../config.json"), {version} = require("../package.json");

module.exports = async bot => {
	console.log(`Bot started successfully on ${new Date()}`);
	
	bot.mentionPrefix = new RegExp(`^<@!?${bot.user.id}>`);
	bot.user.setActivity(`${bot.prefix}help | with you in ${bot.guilds.size} servers`);
	bot.cache.guildCount = bot.guilds.size;
	bot.cache.userCount = bot.users.size;
	bot.cache.channelCount = bot.channels.size;
	
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
					break;
				case 1:
					newBotGame = `with ${bot.cache.channelCount} channels`;
					break;
				case 2:
					newBotGame = `${require("../modules/stats.json").commandTotal} run commands`;
					break;
				case 3:
					newBotGame = `on version ${version}`;
					break;
			}
			
			if (bot.cache.status.pos < 4) {
				bot.cache.status.pos++;
			} else {
				bot.cache.status.pos = 0;
				bot.cache.guildCount = bot.guilds.size;
				bot.cache.userCount = bot.users.size;
				bot.cache.channelCount = bot.channels.size;
			}
		}
		bot.user.setActivity(`${bot.prefix}help | ${newBotGame}`);
	}, 1000*300);
	
	setInterval(() => {
		bot.logStats();
		if (new Date() % (1000*10800) < 1000*3600) {
			if (config.botsOnDiscordToken) bot.postBotsOnDiscordStats(bot);
			if (config.botsForDiscordToken) bot.postBotsForDiscordStats(bot);
			if (config.discordBotsOrgToken) bot.postDiscordBotsOrgStats(bot);
			if (config.ownerServer && config.ownerServer.rssFeed) bot.postRssFeed(bot);
		}
	}, 1000*3600);
};