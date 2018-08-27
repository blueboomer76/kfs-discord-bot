const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const packageInfo = require("../../package.json");

class BotInfoCommand extends Command {
	constructor() {
		super({
			name: "botinfo",
			description: "Get general info about the bot",
			aliases: ["about", "bot", "info"],
			cooldown: {
				time: 30000,
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
		.setTitle("About Kendra")
		.setDescription("Kendra is an actively developed bot that not only has fun, moderation, utility commands, but a phone command for calling other servers, and combines features from popular bots. New commands are added to Kendra often.")
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter(`Bot ID: ${bot.user.id}`)
		.addField("Library", `Discord.js v${packageInfo.dependencies["discord.js"].slice(1)}`, true)
		.addField("Bot Version", `${packageInfo.version}`, true)
		.addField("Stats", `${bot.cache.guildCount} Servers\n${bot.cache.userCount} Users`, true)
		.addField("Bot Invite", "[Go!](https://discordapp.com/api/oauth2/authorize?client_id=429807759144386572&permissions=403041398&scope=bot)", true)
		.addField("Kendra's server", "[Go!](https://discord.gg/yB8TvWU)", true)
		.addField("Upvote this bot", "[Go!](https://discordbots.org/bots/429807759144386572)", true)
		);
	}
}

module.exports = BotInfoCommand;