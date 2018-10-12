const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const {getDuration} = require("../../modules/functions.js");

class StatsCommand extends Command {
	constructor() {
		super({
			name: "stats",
			description: "Get detailed stats for the bot",
			aliases: ["botstats"],
			allowDMs: true,
			cooldown: {
				time: 120000,
				type: "guild"
			},
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			},
			startTyping: true
		});
	}
	
	async run(bot, message, args, flags) {
		let storedStats = require("../../modules/stats.json");
		let processUptime = process.uptime() * 1000;
		let duration = storedStats.duration + (Number(new Date()) - bot.cache.stats.lastCheck);

		let beginEval = new Date();

		let serverCount = bot.guilds.size;
		let bigServerCount = bot.guilds.filter(g => g.large).size;
		let userCount = bot.users.size;
		let onlineUserCount = bot.users.filter(u => u.presence.status != "offline").size;
		let textChannelCount = bot.channels.filter(chnl => chnl.type == "text").size;
		let voiceChannelCount = bot.channels.filter(chnl => chnl.type == "voice").size;
		let categoryCount = bot.channels.filter(chnl => chnl.type == "category").size;
		let commandCurrentTotal = bot.cache.stats.commandCurrentTotal;
		for (let i = 0; i < bot.cache.stats.commandUsages.length; i++) {
			commandCurrentTotal += bot.cache.stats.commandUsages[i].uses;
		}
		let sessionCommands = bot.cache.stats.commandSessionTotal + commandCurrentTotal;
		let totalCommands = storedStats.commandTotal + commandCurrentTotal;
		let sessionCalls = bot.cache.stats.callSessionTotal + bot.cache.stats.callCurrentTotal;
		let totalCalls = storedStats.callTotal + bot.cache.stats.callCurrentTotal;
		let sessionMessages = bot.cache.stats.messageSessionTotal + bot.cache.stats.messageCurrentTotal;
		let totalMessages = storedStats.messageTotal + bot.cache.stats.messageCurrentTotal;

		let endEval = new Date();

		message.channel.send(new Discord.RichEmbed()
		.setAuthor("Bot Stats", bot.user.avatarURL)
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter(`⏰ Took: ${((endEval - beginEval) / 1000).toFixed(2)}s | Stats as of`)
		.setTimestamp(message.createdAt)
		.addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1048576).toFixed(2)} MB`, true)
		.addField("Last Ready", getDuration(bot.readyTimestamp), true)
		.addField("Servers", 
		`Total: ${serverCount.toLocaleString()}` + "\n" +
		`Large: ${bigServerCount.toLocaleString()} (${(bigServerCount * 100 / serverCount).toFixed(1)}%)`
		, true)
		.addField("Users", 
		`Total: ${userCount.toLocaleString()} (${(userCount / serverCount).toFixed(1)}/server)` + "\n" +
		`Online: ${onlineUserCount.toLocaleString()} (${(onlineUserCount / userCount * 100).toFixed(1)}%)`
		, true)
		.addField("Channels", 
		`Text: ${textChannelCount.toLocaleString()} (${(textChannelCount / serverCount).toFixed(2)}/server)` + "\n" +
		`Voice: ${voiceChannelCount.toLocaleString()} (${(voiceChannelCount / serverCount).toFixed(2)}/server)` + "\n" +
		`Categories: ${categoryCount.toLocaleString()} (${(categoryCount / serverCount).toFixed(2)}/server)`
		, true)
		.addField("Commands",
		`Session: ${sessionCommands.toLocaleString()} (${this.setRate(sessionCommands, processUptime)})` + "\n" +
		`Total: ${totalCommands.toLocaleString()} (${this.setRate(totalCommands, duration)})`
		, true)
		.addField("Phone Connections",
		`Session: ${sessionCalls.toLocaleString()} (${this.setRate(sessionCalls, processUptime)})` + "\n" +
		`Total: ${totalCalls.toLocaleString()} (${this.setRate(totalCalls, duration)})`
		, true)
		.addField("Messages Seen",
		`Session: ${sessionMessages.toLocaleString()} (${this.setRate(sessionMessages, processUptime)})` + "\n" +
		`Total: ${totalMessages.toLocaleString()} (${this.setRate(totalMessages, duration)})`
		, true)
		)
	}
	
	/*
		Others found:
		Bot Author, Shard Number, RAM Usage, Shard Uptime
		
		Ratios, Min, Max, Average of the following:
		Percent Online/Guild
		Music Listeners/Guild
		Music Listener Percent/Guild
		Music Connections/Guild
		Queue Size
		Being the only bot in a server
	*/

	setRate(amount, duration) {
		let amtPerDay = amount / duration * 8.64e+7;
		if (amtPerDay > 43200) {
			return `${(amtPerDay/86400).toFixed(2)}/sec`;
		} else if (amtPerDay > 720) {
			return `${(amtPerDay/1440).toFixed(2)}/min`;
		} else if (amtPerDay > 12) {
			return `${(amtPerDay/24).toFixed(2)}/hr`;
		} else {
			return `${amtPerDay.toFixed(2)}/day`;
		}
	}
}

module.exports = StatsCommand;
