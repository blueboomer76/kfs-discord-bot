const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const {getDuration} = require("../../modules/functions.js");
const stats = require("../../modules/stats.json");
const {version} = require("../../package.json");

class StatsCommand extends Command {
	constructor() {
		super({
			name: "stats",
			description: "Get detailed stats for the Kendra bot",
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
		let beginEval = new Date();
		let serverCount = bot.guilds.size;
		let bigServerCount = bot.guilds.filter(g => g.large).size;
		let userCount = bot.users.size;
		let onlineUserCount = bot.users.filter(u => u.presence.status != "offline").size;
		let textChannelCount = bot.channels.filter(chnl => chnl.type == "text").size;
		let voiceChannelCount = bot.channels.filter(chnl => chnl.type == "voice").size;
		let categoryCount = bot.channels.filter(chnl => chnl.type == "category").size;
		let sessionMessages = bot.cache.stats.messageCurrentTotal + bot.cache.stats.messageSessionTotal;
		let totalMessages = stats.messageTotal + bot.cache.stats.messageCurrentTotal;
		let sessionCalls = bot.cache.stats.callCurrentTotal + bot.cache.stats.callSessionTotal
		let totalCalls = stats.callTotal + bot.cache.stats.callCurrentTotal;
		let commandCurrentTotal = bot.cache.stats.commandCurrentTotal;
		for (let i = 0; i < bot.cache.stats.commandUsage.length; i++) {
			commandCurrentTotal += bot.cache.stats.commandUsage[i].uses;
		}
		let sessionCommands = commandCurrentTotal + bot.cache.stats.commandSessionTotal;
		let totalCommands = stats.commandTotal + commandCurrentTotal;
		let endEval = new Date();
		message.channel.send(new Discord.RichEmbed()
		.setAuthor(`Kendra Bot Stats`, bot.user.avatarURL)
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter(`⏰ Took: ${((endEval - beginEval) / 1000).toFixed(2)}s | Stats as of`)
		.setTimestamp(message.createdAt)
		.setDescription("Here's some detailed stats about the Kendra bot!")
		.addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1048576).toFixed(2)} MB`, true)
		.addField("Last Restart", getDuration(bot.readyTimestamp), true)
		.addField("Servers", 
		`Total: ${serverCount.toLocaleString()}` + `\n` +
		`Large: ${bigServerCount.toLocaleString()} (${(bigServerCount * 100 / serverCount).toFixed(1)}%)`
		, true)
		.addField("Users", 
		`Total: ${userCount.toLocaleString()} (${(userCount / serverCount).toFixed(1)}/server)` + `\n` +
		`Online: ${onlineUserCount.toLocaleString()} (${(onlineUserCount / userCount * 100).toFixed(1)}%)`
		, true)
		.addField("Channels", 
		`Text: ${textChannelCount.toLocaleString()} (${(textChannelCount / serverCount).toFixed(2)}/server)` + `\n` +
		`Voice: ${voiceChannelCount.toLocaleString()} (${(voiceChannelCount / serverCount).toFixed(2)}/server)` + `\n` +
		`Categories: ${categoryCount.toLocaleString()} (${(categoryCount / serverCount).toFixed(2)}/server)`
		, true)
		.addField("Messages Seen",
		`Session: ${sessionMessages.toLocaleString()} (${(1000 * sessionMessages / (Number(new Date()) - bot.readyTimestamp)).toFixed(2)}/sec)` + `\n` +
		`Total: ${totalMessages.toLocaleString()} (${(1000 * totalMessages / stats.duration).toFixed(2)}/sec)`
		, true)
		.addField("Phone Calls Made",
		`Session: ${sessionCalls.toLocaleString()} (${(3600000 * sessionCalls / (Number(new Date()) - bot.readyTimestamp)).toFixed(2)}/hr)` + `\n` +
		`Total: ${totalCalls.toLocaleString()} (${(3600000 * totalCalls / stats.duration).toFixed(2)}/hr)`
		, true)
		.addField("Commands",
		`Session: ${sessionCommands.toLocaleString()} (${(60000 * sessionCommands / (Number(new Date()) - bot.readyTimestamp)).toFixed(2)}/min)` + `\n` +
		`Total: ${totalCommands.toLocaleString()} (${(60000 * totalCommands / stats.duration).toFixed(2)}/min)`
		, true)
		)
	}
	
	/*
		Others found:
		Bot Author, Shard Number, RAM Usage, Shard Uptime,
		
		Ratios, Min, Max, Average,:
		Pct Online/Guild
		Music Listeners/Guild
		ML Pct/Guild
		Music Connections/Guild
		Queue Size
		Being the only bot in a server
	*/
}

module.exports = StatsCommand;