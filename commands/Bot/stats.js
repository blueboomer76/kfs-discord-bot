const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const {getDuration} = require("../../modules/functions.js");

class StatsCommand extends Command {
	constructor() {
		super({
			name: "stats",
			description: "Get detailed stats for the bot",
			aliases: ["botstats"],
			category: "Bot",
			cooldown: {
				time: 120000,
				type: "guild"
			},
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
		let textChannelCount = bot.channels.filter(chnl => chnl.type == "text").size;
		let voiceChannelCount = bot.channels.filter(chnl => chnl.type == "voice").size;
		let categoryCount = bot.channels.filter(chnl => chnl.type == "category").size;

		let endEval = new Date();

		message.channel.send(new Discord.RichEmbed()
		.setAuthor("Bot Stats", bot.user.avatarURL)
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter(`⏰ Took: ${endEval - beginEval}ms | Stats as of`)
		.setTimestamp(message.createdAt)
		.addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1048576).toFixed(2)} MB`, true)
		.addField("Last Ready", getDuration(bot.readyTimestamp), true)
		.addField("Servers", 
		`Total: ${serverCount.toLocaleString()}` + "\n" +
		`Large: ${bigServerCount.toLocaleString()} (${(bigServerCount * 100 / serverCount).toFixed(2)}%)`
		, true)
		.addField("Users", 
		`Total: ${userCount.toLocaleString()} (${(userCount / serverCount).toFixed(2)}/server)` + "\n" +
		`Online: ${onlineUserCount.toLocaleString()} (${(onlineUserCount / userCount * 100).toFixed(2)}%)`
		, true)
		.addField("Channels", 
		`Text: ${textChannelCount.toLocaleString()} (${(textChannelCount / serverCount).toFixed(2)}/server)` + "\n" +
		`Voice: ${voiceChannelCount.toLocaleString()} (${(voiceChannelCount / serverCount).toFixed(2)}/server)` + "\n" +
		`Categories: ${categoryCount.toLocaleString()} (${(categoryCount / serverCount).toFixed(2)}/server)`
		, true)
		)
	}
	
	/*
		Others found:
		Bot Author, Shard Number, Command Count, Owner ID(s), RAM Usage, Shard Uptime
		
		Ratios, Min, Max, Average of the following:
		Percent Online/Guild
		Music Listeners/Guild
		Music Listener Percent/Guild
		Music Connections/Guild
		Queue Size
		Being the only bot in a server
	*/
}

module.exports = StatsCommand;
