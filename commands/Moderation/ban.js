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
				}
			],
			category: "Moderation",
			cooldown: {
				time: 25000,
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
				bot: ["BAN_MEMBERS"],
				user: ["BAN_MEMBERS"],
				level: 1
			},
			usage: "ban <user>"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		await member.ban()
		.then(message.channel.send(`✅ The user **${member.user.tag}** was banned from the guild.`))
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	}
}

module.exports = BanCommand;