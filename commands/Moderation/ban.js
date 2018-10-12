const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class BanCommand extends Command {
	constructor() {
		super({
			name: "ban",
			description: "Bans a user. It will be logged if a modlog channel was set",
			args: [
				{
					num: Infinity,
					type: "member"
				},
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
						num: 1,
						type: "number",
						min: 0,
						max: 14
					}
				},
				{
					name: "reason",
					desc: "Reason to put in the audit log",
					arg: {
						num: 1,
						type: "string"
					}
				}
			],
			perms: {
				bot: ["BAN_MEMBERS"],
				user: ["BAN_MEMBERS"],
				level: 0
			},
			usage: "ban <user>"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0],
			daysFlag = flags.find(f => f.name == "days"),
			reasonFlag = flags.find(f => f.name == "reason");
		await member.ban({
			days: daysFlag ? daysFlag.args[0] : 0,
			reason: reasonFlag ? reasonFlag.args[0] : null
		})
		.then(message.channel.send(`✅ The user **${member.user.tag}** was banned from the guild.`))
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	}
}

module.exports = BanCommand;