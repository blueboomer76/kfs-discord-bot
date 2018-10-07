const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class KickCommand extends Command {
	constructor() {
		super({
			name: "kick",
			description: "Kicks a member. It will be logged if a modlog channel was set",
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
			flags: [
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
				bot: ["KICK_MEMBERS"],
				user: ["KICK_MEMBERS"],
				level: 0
			},
			usage: "kick <user>"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0], reasonFlag = flags.find(f => f.name == "reason");
		await member.kick(reasonFlag ? reasonFlag.args[0] : null)
		.then(message.channel.send(`✅ The user **${member.user.tag}** was kicked from the guild.`))
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	}
}

module.exports = KickCommand;