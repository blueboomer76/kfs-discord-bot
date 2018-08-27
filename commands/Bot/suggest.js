const Command = require("../../structures/command.js");

class SuggestCommand extends Command {
	constructor() {
		super({
			name: "suggest",
			description: "Suggest new features or report problems",
			aliases: ["feedback", "complain", "report"],
			args: [
				{
					errorMsg: "You must provide a suggestion or problem to send.",
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
		if (!bot.ideaWebhook) return message.channel.send("The suggestions webhook has not been set up.");
		let sourceFooter;
		if (message.guild) {
			sourceFooter = `#${message.channel.name} (ID ${message.channel.id}) in ${message.guild.name} (ID ${message.guild.id})`;
		} else {
			sourceFooter = `From ${message.author.tag}`;
		}
		bot.ideaWebhook.send({
			embeds: [{
				description: args[0].replace(/https?:\/\/\S+\.\S+/gi, "").replace(/discord\.gg\/[0-9a-z]+/gi, "").replace(/discordapp\.com\/invite\/[0-9a-z]+/gi, ""),
				author: {
					name: message.author.tag,
					icon_url: message.author.avatarURL
				},
				color: Math.floor(Math.random() * 16777216),
				footer: {
					text: sourceFooter,
					timestamp: message.createdAt
				}
			}]
		})
		.then(() => {
			message.channel.send("The suggestion has been sent.");
		})
		.catch(() => {
			message.channel.send("Failed to send the suggestion.");
		})
	}
}

module.exports = SuggestCommand;
