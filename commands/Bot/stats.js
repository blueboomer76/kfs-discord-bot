const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const {getDuration} = require("../../modules/functions.js");
const stats = require("../../modules/stats.json");
const {version} = require("../../package.json");

class StatsCommand extends Command {
	constructor() {
		super({
			name: "stats",
			description: "Get stats for the Kendra bot",
			aliases: ["botstats"],
			cooldown: {
				time: 120000,
				type: "guild"
			},
			flags: [
				{
					name: "advanced"
				}
			],
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			}
		});
	}
	
	async run(bot, message, args, flags) {
		let beginEval = new Date();
		let serverCount = bot.guilds.size;
		let bigServerCount = bot.guilds.filter(g => g.large).size;
		let userCount = bot.users.size;
		let onlineUserCount = bot.users.filter(u => u.presence.status != "offline").size;
		let onlineUserCountArray = bot.guilds.map(g => g.presences.size);
		let textChannelCount = bot.channels.filter(chnl => chnl.type == "text").size;
		let voiceChannelCount = bot.channels.filter(chnl => chnl.type == "voice").size;
		let categoryCount = bot.channels.size - (textChannelCount + voiceChannelCount);
		let sessionMessages = bot.cache.stats.messageCurrentTotal + bot.cache.stats.messageSessionTotal
		let totalMessages = stats.messageTotal + bot.cache.stats.messageCurrentTotal;
		let commandCurrentTotal = 1;
		for (let i = 0; i < bot.cache.stats.commandUsage.length; i++) {
			commandCurrentTotal += bot.cache.stats.commandUsage[i].uses;
		}
		let sessionCommands = commandCurrentTotal + bot.cache.stats.commandSessionTotal;
		let totalCommands = stats.commandTotal + commandCurrentTotal;
		let endEval = new Date();
		message.channel.send(new Discord.RichEmbed()
		.setAuthor(`KendraBot ver. ${version}`, bot.user.avatarURL)
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter(`⏰ Took: ${endEval - beginEval}ms | Stats as of`)
		.setTimestamp(message.createdAt)
		.setDescription("Here's some detailed stats about the Kendra bot!")
		.addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1048576).toFixed(2)} MB`, true)
		.addField("Last Restart", getDuration(bot.readyTimestamp), true)
		.addField("Servers", 
		`Total: ${serverCount.toLocaleString()}` + `\n` +
		`Large: ${bigServerCount.toLocaleString()} (${(bigServerCount * 100 / serverCount).toFixed(2)}%)`
		, true)
		.addField("Users", 
		`Total: ${userCount.toLocaleString()} (${(userCount / serverCount).toFixed(2)}/server)` + `\n` +
		`Online: ${onlineUserCount.toLocaleString()} (${(onlineUserCount / userCount * 100).toFixed(2)}%)`
		, true)
		.addField("Channels", 
		`Text: ${textChannelCount.toLocaleString()} (${(textChannelCount / serverCount).toFixed(2)}/server)` + `\n` +
		`Voice: ${voiceChannelCount.toLocaleString()} (${(voiceChannelCount / serverCount).toFixed(2)}/server)` + `\n` +
		`Categories: ${categoryCount.toLocaleString()} (${(categoryCount / serverCount).toFixed(2)}/server)`
		, true)
		.addField("Messages Seen",
		`Session: ${sessionMessages.toLocaleString()} (${(1000 * sessionMessages / (Number(new Date()) - bot.readyTimestamp)).toFixed(2)}/sec)` + `\n` +
		`Total: ${stats.messageTotal.toLocaleString()} (${(1000 * stats.messageTotal / stats.duration).toFixed(2)}/sec)`
		, true)
		.addField("Commands",
		`Session: ${sessionCommands.toLocaleString()} (${(1000 * sessionCommands / (Number(new Date()) - bot.readyTimestamp)).toFixed(3)}/sec)` + `\n` +
		`Total: ${stats.commandTotal.toLocaleString()} (${(1000 * stats.commandTotal / stats.duration).toFixed(3)}/sec)`
		, true)
		)
	}
	
	/*
		Others found:
		Bot Author, Shard Number, Command Count, Owner ID(s), RAM Usage, Shard Uptime,
		
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