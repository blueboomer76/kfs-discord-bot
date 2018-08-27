const Command = require("../../structures/command.js");

class SetNicknameCommand extends Command {
	constructor() {
		super({
			name: "setnickname",
			description: "Changes a user's nickname in this server",
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
			usage: "setnickname <user> <new nickname>"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		let newNick = args[1];
		if (member.id == message.author.id || member.id == message.guild.owner.id || member.id == bot.user.id) return message.channel.send("This command cannot be used on yourself, the server owner, or the bot.");
		if (message.author.id != message.guild.owner.id && member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
			return message.channel.send("Cannot set nickname: your highest role must be higher than the user's highest role");
		}
		member.setNickname(newNick)
		.then(() => message.channel.send(`✅ Nickname of **${member.user.tag}** has been set to **${newNick}**.`))
		.catch(() => message.channel.send("Could not set the new nickname for the user."))
	}
};

module.exports = SetNicknameCommand;
