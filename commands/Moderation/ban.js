const Command = require("../../structures/command.js");

class BanCommand extends Command {
	constructor() {
		super({
			name: "ban",
			description: "Bans a user from this server",
			args: [
				{
					num: Infinity,
					type: "member"
				}
			],
			cooldown: {
				time: 25000,
				type: "user"
			},
			perms: {
				bot: ["BAN_MEMBERS"],
				user: ["BAN_MEMBERS"],
				level: 1
			},
			usage: "ban <user>"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		if (member.id == message.author.id || member.id == bot.user.id) return message.channel.send("This command cannot be used on yourself or the bot.");
		if (message.author.id != message.guild.owner.id && member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
			return message.channel.send("Cannot ban: your highest role must be higher than the user's highest role (overrides with server owner)");
		} else if (member.highestRole.comparePositionTo(message.guild.member(bot.user).highestRole) >= 0) {
			return message.channel.send("Cannot ban: the bot's highest role must be higher than the user's highest role");
		}

		member.ban()
		.then(() => message.channel.send(`✅ The user **${member.user.tag}** was banned from the server.`))
		.catch(err => message.channel.send("An error has occurred while trying to ban the user: `" + err + "`"))
	}
}

module.exports = BanCommand;
