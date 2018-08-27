const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class InviteCommand extends Command {
	constructor() {
		super({
			name: "invite",
			description: "Get info about inviting the bot, joining the bot's server, or its references",
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
		.setTitle("Bot References")
		.setDescription("Exciting! Now you have the chance to spread the love!")
		.setColor(Math.floor(Math.random() * 16777216))
		.addField("Bot Invite", "[Go!](https://discordapp.com/oauth2/authorize?client_id=333058410465722368&permissions=405921878&scope=bot)")
		.addField("Support Server", "[Go!](https://discord.gg/yB8TvWU)")
		.addField("Upvote this bot", "[Go!](https://discordbots.org/bots/333058410465722368)")
		);
	}
}

module.exports = InviteCommand;
