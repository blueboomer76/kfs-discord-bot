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
			flags: [
				{
					name: "days",
					desc: "Number of days to delete messages",
					arg: {
						type: "number",
						min: 0,
						max: 7
					}
				},
				{
					name: "reason",
					desc: "Reason to put in the audit log",
					arg: {
						type: "string"
					}
				}
			],
			perms: {
				bot: ["BAN_MEMBERS"],
				user: ["BAN_MEMBERS"],
				level: 0
			},
			usage: "ban <user> [--days <0-7>] [--reason <reason>]"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		if (member.id == message.author.id || member.id == message.guild.owner.id || member.id == bot.user.id) return message.channel.send("This command cannot be used on yourself, the server owner, or the bot.");
		if (message.author.id != message.guild.owner.id && member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
			return message.channel.send("Cannot ban: your highest role must be higher than the user's highest role (overrides with server owner)");
		} else if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) {
			return message.channel.send("Cannot ban: the bot's highest role must be higher than the user's highest role");
		}

		let daysFlag = flags.find(f => f.name == "days"),
			reasonFlag = flags.find(f => f.name == "reason");
		member.ban({
			days: daysFlag ? daysFlag.args : 0,
			reason: reasonFlag ? reasonFlag.args : null
		})
		.then(() => message.channel.send(`✅ The user **${member.user.tag}** was banned from the server.`))
		.catch(err => message.channel.send("An error has occurred while trying to ban the user: `" + err + "`"))
	}
}

module.exports = BanCommand;
