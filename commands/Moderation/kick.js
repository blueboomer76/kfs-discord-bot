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
					arg: {
						num: 1,
						type: "string"
					}
				}
			],
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
		await member.kick()
		.then(message.channel.send(`✅ The user **${member.user.tag}** was kicked from the guild.`))
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	}
}

module.exports = KickCommand;