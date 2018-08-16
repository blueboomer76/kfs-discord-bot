const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class SayCommand extends Command {
	constructor() {
		super({
			name: "say",
			description: "Have the bot say something for you",
			args: [
				{
					num: Infinity,
					type: "string"
				}
			],
			category: "Fun",
			flags: [
				{
					name: "embed"
				}
			],
			guildOnly: true,
			perms: {
				bot: ["MANAGE_MESSAGES"],
				user: [],
				level: 0
			},
			usage: "say <message> [--embed]"
		});
	}
	
	async run(bot, message, args, flags) {
		message.delete();
		let embedFlag = flags.find(f => f.name == "embed")
		if (embedFlag) {
			if (!message.guild.member(bot.user).hasPermission("EMBED_LINKS")) return message.channel.send("To post an embed, the bot requires the `EMBED_LINKS` permission.")
			message.channel.send(new Discord.RichEmbed()
			.setColor(Math.floor(Math.random() * 16777216))
			.setDescription(args[0])
			)
		} else {
			message.channel.send(args[0]);
		}
	}
}

module.exports = SayCommand;
