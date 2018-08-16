const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class SuggestCommand extends Command {
	constructor() {
		super({
			name: "suggest",
			aliases: ["feedback", "complain", "report"],
			description: "Suggest new features for the bot, or report problems",
			args: [
				{
					errorMsg: "You must provide a suggestion or problem to send to the official bot server.",
					num: Infinity,
					type: "string"
				}
			],
			cooldown: {
				time: 30000,
				type: "user"
			},
			usage: "suggest <suggestion>"
		});
	}
	
	async run(bot, message, args, flags) {
		bot.ideaWebhook.send({
			embeds: [{
				author: {
					name: message.author.tag,
					icon_url: message.author.avatarURL
				},
				color: Math.floor(Math.random() * 16777216),
				footer: {
					text: `#${message.channel.name} \(ID ${message.channel.id}) in ${message.guild.name} (ID ${message.guild.id})`,
					timestamp: message.createdAt
				},
				description: args[0].replace(/discord\.gg\/[0-9a-z]+/gi, "").replace(/discordapp\.com\/invite\/[0-9a-z]+/gi, "")
			}]
		})
		.then(() => {
			message.channel.send("Your suggestion has been sent to the support server.");
		}).catch(err => {
			message.channel.send("Failed to send suggestion to support server.");
		})
	}
}

module.exports = SuggestCommand;