const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const {version} = require("../../package.json");

class BotInfoCommand extends Command {
	constructor() {
		super({
			name: "botinfo",
			description: "Get general info about the bot",
			aliases: ["about", "bot", "info"],
			allowDMs: true,
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
		message.channel.send(new Discord.RichEmbed()
		.setTitle("About this bot")
		.setDescription("This is an actively developed bot that not only has fun, moderation, utility commands, but a phone command for calling other servers, and combines features from popular bots.")
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter(`Bot ID: ${bot.user.id}`)
		.addField("Library", `Discord.js v${Discord.version}`, true)
		.addField("Bot Version", version, true)
		.addField("Stats", `${bot.cache.guildCount} Servers\n${bot.cache.userCount} Users`, true)
		.addField("Bot Invite", "[Go!](https://discordapp.com/oauth2/authorize?client_id=333058410465722368&permissions=405921878&scope=bot)", true)
		.addField("Support Server", "[Go!](https://discord.gg/yB8TvWU)", true)
		.addField("Upvote this bot", "[Go!](https://discordbots.org/bots/333058410465722368)", true)
		);
	}
}

module.exports = BotInfoCommand;
