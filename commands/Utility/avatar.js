const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class AvatarCommand extends Command {
	constructor() {
		super({
			name: "avatar",
			description: "Get a user's avatar",
			aliases: ["profilepic", "pfp"],
			args: [
				{
					argsNum: Infinity,
					optional: true,
					type: "member"
				}
			],
			category: "Utility",
			cooldown: {
				time: 15000,
				type: "channel"
			},
			guildOnly: true,
			usage: "avatar [user]"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		if (!member) member = message.member;
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Avatar - " + member.user.tag)
		.setColor(Math.floor(Math.random() * 16777216))
		.setImage(member.user.avatarURL)
		);
	}
}

module.exports = AvatarCommand;