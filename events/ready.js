const {parseLargeNumber} = require("../modules/functions.js"),
	config = require("../config.json"),
	{version} = require("../package.json");

const rssFeedSitesLen = config.rssFeedWebsites.length;
const rssFeedPostInt = rssFeedSitesLen < 100 ? (3 - Math.floor(rssFeedSitesLen / 50)) * 3600 : 3600,
	rssFeedPostAmt = rssFeedSitesLen < 40 ? Math.ceil(rssFeedSitesLen / 10) : 5;
const parserOptions = {
	capSuffix: true,
	maxFullShow: 1000000,
	noSpace: true,
	precision: 4,
	shortSuffix: true
};

let initialized = false;

module.exports = async bot => {
	console.log("=".repeat(30) + " READY " + "=".repeat(30));
	console.log(`[${new Date().toJSON()}] Bot has entered ready state.`);
	bot.user.setActivity(`${bot.prefix}help | with you in ${bot.guilds.size} servers`);

	bot.cache.guildCount = bot.guilds.size;
	bot.cache.userCount = bot.users.size;
	bot.cache.channelCount = bot.channels.size;
	bot.connectionRetries = 0;

	if (!initialized) {
		initialized = true;
		bot.mentionPrefix = new RegExp(`^<@!?${bot.user.id}>`);
		setInterval(() => {
			let newBotGame;
			if (Math.random() < 0.5 && bot.cache.status.randomIters < 2) {
				bot.cache.status.randomIters++;
				newBotGame = config.customStatusMessages[Math.floor(Math.random() * config.customStatusMessages.length)];
			} else {
				bot.cache.status.randomIters = 0;
				switch (bot.cache.status.pos) {
					case 0:
						newBotGame = `with ${parseLargeNumber(bot.cache.userCount, parserOptions)} users`;
						break;
					case 1:
						newBotGame = `with ${parseLargeNumber(bot.cache.channelCount, parserOptions)} channels`;
						break;
					case 2:
						newBotGame = parseLargeNumber(bot.cache.cumulativeStats.commandTotal, parserOptions) + " run commands";
						break;
					case 3:
						newBotGame = parseLargeNumber(bot.cache.cumulativeStats.messageTotal, parserOptions) + " read messages";
						break;
					case 4:
						newBotGame = "on version " + version;
						break;
				}

				if (bot.cache.status.pos < 5) {
					bot.cache.status.pos++;
				} else {
					bot.cache.status.pos = 0;
					bot.cache.guildCount = bot.guilds.size;
					bot.cache.userCount = bot.users.size;
					bot.cache.channelCount = bot.channels.size;
					newBotGame = `with you in ${bot.cache.guildCount} servers`;
				}
			}
			bot.user.setActivity(bot.prefix + "help | " + newBotGame);
		}, 1000 * 300);

		setInterval(() => {
			bot.logStats();

			// Post stats every 3 hours
			if (Date.now() % (1000*10800) < 1000*3600) {
				if (config.botsOnDiscordToken) bot.postBotsOnDiscordStats();
				if (config.botsForDiscordToken) bot.postBotsForDiscordStats();
				if (config.discordBotsOrgToken) bot.postDiscordBotsOrgStats();
			}

			// Post the RSS and meme feeds if configured
			if (config.rssFeedChannel && Array.isArray(config.rssFeedWebsites) &&
				(rssFeedPostInt == 3600 || Date.now() % (1000 * rssFeedPostInt) < 1000*3600)) {
				bot.postRSSFeed(rssFeedPostAmt);
			}
			if (config.memeFeedChannel && Date.now() % (1000*21600) < 1000*3600) {
				bot.postMeme();
			}
		}, 1000 * 3600);
	}
};
