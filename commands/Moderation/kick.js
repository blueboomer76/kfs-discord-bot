const Command = require("../../structures/command.js");

class KickCommand extends Command {
	constructor() {
		super({
			name: "kick",
			description: "Kicks a user from this server",
			args: [
				{
					num: Infinity,
					type: "member"
				}
			],
			category: "Moderation",
			cooldown: {
				time: 20000,
				type: "user"
			},
			guildOnly: true,
			perms: {
				bot: ["KICK_MEMBERS"],
				user: ["KICK_MEMBERS"],
				level: 1
			},
			usage: "kick <user>"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		if (member.id == message.author.id || member.id == bot.user.id) return message.channel.send("This command cannot be used on yourself or the bot.");
		if (message.author.id != message.guild.owner.id && member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
			return message.channel.send("Cannot kick: your highest role must be higher than the user's highest role");
		}
		member.kick()
		.then(() => message.channel.send(`✅ The user **${member.user.tag}** was kicked from the server.`))
		.catch(() => message.channel.send("Could not kick the user from the server."))
	}
}

module.exports = KickCommand;
