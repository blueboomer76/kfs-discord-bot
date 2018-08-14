const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const functions = require("../../modules/functions.js");
const {version} = require("../../package.json");

class BotInfoCommand extends Command {
	constructor() {
		super({
			name: "botinfo",
			description: "Get info about the bot",
			aliases: ["bot"],
			category: "Bot",
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
		let serverCount = bot.guilds.size;
		let userCount = bot.users.size;
		let channelCount = bot.channels.size;
		message.channel.send(new Discord.RichEmbed()
		.setAuthor("KFS Discord Bot ver. " + version, bot.user.avatarURL)
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter("Bot ID: " + bot.user.id + " | Bot stats as of")
		.setTimestamp(message.createdAt)
		.addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1048576).toFixed(2)} MB`, true)
		.addField("Last Ready", functions.getDuration(bot.readyTimestamp), true)
		.addField("Servers", serverCount.toLocaleString(), true)
		.addField("Users", `${userCount.toLocaleString()}\n(${(userCount / serverCount).toFixed(2)} / server)`, true)
		.addField("Channels", `${channelCount.toLocaleString()}\n(${(channelCount / serverCount).toFixed(2)} / server)`, true)
		);
	}
	/*
		Others found:
		Bot Author, Shard Number, Command Count, Msgs/Sec, Owner ID(s), Num Text/Voice Channels, Ping, Last Message,
		RAM Usage, Shard Uptime, Global Guilds, Channels, Users
		
		Ratios, Min, Max, Average of the following:
		Users/Guild
		Online Users/Guild
		Percent Online/Guild
		Text Channels/Guild
		Voice Channels/Guild
		Music Listeners/Guild
		Music Listener Percent/Guild
		Music Connections/Guild
		Queue Size
		Big servers
		Being the only bot in a server
	*/
}

module.exports = BotInfoCommand;
