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
			cooldown: {
				time: 20000,
				type: "user"
			},
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
		if (member.id == message.author.id || member.id == message.guild.owner.id || member.id == bot.user.id) return message.channel.send("This command cannot be used on yourself, the server owner, or the bot.");
		if (message.author.id != message.guild.owner.id && member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
			return message.channel.send("Cannot kick: your highest role must be higher than the user's highest role (overrides with server owner)");
		} else if (member.highestRole.comparePositionTo(message.guild.member(bot.user).highestRole) >= 0) {
			return message.channel.send("Cannot kick: the bot's highest role must be higher than the user's highest role");
		}

		member.kick()
		.then(() => message.channel.send(`✅ The user **${member.user.tag}** was kicked from the server.`))
		.catch(err => message.channel.send("An error has occurred while trying to kick the user: `" + err + "`"))
	}
}

module.exports = KickCommand;
