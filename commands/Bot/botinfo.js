const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const functions = require("../../modules/functions.js");
const stats = require("../../modules/stats.json");
const {version} = require("../../package.json");

class BotInfoCommand extends Command {
	constructor() {
		super({
			name: "botinfo",
			description: "Get info about the Kendra bot",
			aliases: ["bot"],
			cooldown: {
				time: 60000,
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
		let sessionMessages = bot.cache.messages.currentCount + bot.cache.messages.sessionCount;
		let serverCount = bot.guilds.size;
		let userCount = bot.users.size;
		let channelCount = bot.channels.size;
		message.channel.send(new Discord.RichEmbed()
		.setAuthor("KendraBot ver. " + version, bot.user.avatarURL)
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter("Bot ID: " + bot.user.id + " | Bot stats as of")
		.setTimestamp(message.createdAt)
		.addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1048576).toFixed(2)} MB`, true)
		.addField("Last Restart", functions.getDuration(bot.readyTimestamp), true)
		.addField("Servers", serverCount.toLocaleString(), true)
		.addField("Users", `${userCount.toLocaleString()}\n(${(userCount / serverCount).toFixed(2)} / server)`, true)
		.addField("Channels", `${channelCount.toLocaleString()}\n(${(channelCount / serverCount).toFixed(2)} / server)`, true)
		.addField("Messages (Session)", `${sessionMessages.toLocaleString()}\n(${(1000 * sessionMessages / (Number(new Date()) - bot.readyTimestamp)).toFixed(2)} / sec)`, true)
		)
	}
	
	/*
		Others found:
		Bot Author, Shard Number, Command Count, Owner ID(s), Num Text/Voice Channels, Ping,
		RAM Usage, Shard Uptime, Global Guilds, Channels, Users
		
		Ratios, Min, Max, Average,:
		Online Users/Guild
		Pct Online/Guild
		Text Chnls/Guild
		Voice Chnls/Guild
		Music Listeners/Guild
		ML Pct/Guild
		Music Connections/Guild
		Queue Size
		Big servers
		Being the only bot in a server
	*/
}

module.exports = BotInfoCommand;