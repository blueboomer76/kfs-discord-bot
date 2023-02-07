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
	const now = new Date();

	console.log("=".repeat(30) + " READY " + "=".repeat(30));
	console.log(`[${now.toJSON()}] Bot has entered ready state.`);
	bot.user.setActivity(`/help | with you in ${bot.guilds.cache.size} servers`);

	bot.cache.guildCount = bot.guilds.cache.size;
	bot.cache.userCount = bot.users.cache.size;
	bot.cache.channelCount = bot.channels.cache.size;
	bot.connectionRetries = 0;

	if (bot.downtimeTimestampBase != null) {
		bot.cache.cumulativeStats.duration -= now.getTime() - bot.downtimeTimestampBase;
		bot.downtimeTimestampBase = null;
	}

	if (!initialized) {
		initialized = true;
		bot.mentionPrefix = new RegExp(`^<@!?${bot.user.id}>`);

		if (process.argv[2] == "--init") {
			// If the --init flag is set, set up built-in slash commands
			bot.replaceSlashCommands()
				.then(() => console.log("Successfully replaced slash commands!"));
		} else {
			// Make sure the "commands" slash command exists on Discord, not just on the local bot instance
			const commands = await bot.application.commands.fetch();

			const slashCommandsFromDiscord = [...commands.values()];
			if (!slashCommandsFromDiscord.some(sc => sc.name == "commands")) {
				bot.upsertSlashCommand("commands");
			}

			// Check if any commands are mismatched between Discord and this bot instance
			const namesFromDiscord = slashCommandsFromDiscord.map(sc => sc.name),
				namesFromBot = [...bot.slashCommands.keys()];

			const diff1 = namesFromDiscord.filter(n => !namesFromBot.includes(n)),
				diff2 = namesFromBot.filter(n => !namesFromDiscord.includes(n));
			if (diff1.length > 0) console.log("These commands from Discord were not found on the bot:", diff1);
			if (diff2.length > 0) console.log("These commands from the bot were not found on Discord:", diff2);
		}

		// Set bot's status regularly
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
						newBotGame = parseLargeNumber(bot.cache.cumulativeStats.interactionTotal, parserOptions) + " run commands";
						break;
					case 3:
						newBotGame = "on version " + version;
						break;
				}

				if (bot.cache.status.pos < 4) {
					bot.cache.status.pos++;
				} else {
					bot.cache.status.pos = 0;
					bot.cache.guildCount = bot.guilds.cache.size;
					bot.cache.userCount = bot.users.cache.size;
					bot.cache.channelCount = bot.channels.cache.size;
					newBotGame = `with you in ${bot.cache.guildCount} servers`;
				}
			}
			bot.user.setActivity("/help | " + newBotGame);
		}, 1000 * 300);

		setInterval(() => {
			bot.logStats();

			// Post stats every 3 hours
			if (Date.now() % (1000*10800) < 1000*3600) {
				if (config.discordBotsOrgToken) {
					bot.postStatsToWebsite(`https://discordbots.org/api/bots/${bot.user.id}/stats`,
						{"Authorization": config.discordBotsOrgToken}, {"server_count": bot.guilds.cache.size});
				}
				if (config.botsOnDiscordToken) {
					bot.postStatsToWebsite(`https://bots.ondiscord.xyz/bot-api/bots/${bot.user.id}/guilds`,
						{"Authorization": config.botsOnDiscordToken}, {"guildCount": bot.guilds.cache.size});
				}
				if (config.botsForDiscordToken) {
					bot.postStatsToWebsite("https://botsfordiscord.com/api/bot/" + bot.user.id, {
						"Content-Type": "application/json",
						"Authorization": config.botsForDiscordToken
					}, {"server_count": bot.guilds.cache.size});
				}
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
