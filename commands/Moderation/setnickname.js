const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class SetNicknameCommand extends Command {
	constructor() {
		super({
			name: "setnickname",
			description: "Changes a member's nickname. It will be logged if a modlog channel was set",
			aliases: ["changenick", "setnick"],
			args: [
				{
					allowQuotes: true,
					num: Infinity,
					type: "member"
				},
				{
					num: Infinity,
					type: "string"
				}
			],
			cooldown: {
				time: 20000,
				type: "user"
			},
			guildOnly: true,
			perms: {
				bot: ["MANAGE_NICKNAMES"],
				user: ["MANAGE_NICKNAMES"],
				level: 1
			},
			usage: "setnickname <user> <new nick>"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		let newNick = args[1];
		await member.setNickname(newNick)
		.then(message.channel.send(`✅ Nickname of **${member.user.tag}** has been set to **${newNick}.**`))
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	}
}

module.exports = SetNicknameCommand;