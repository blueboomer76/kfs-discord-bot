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
					num: Infinity,
					optional: true,
					type: "member"
				}
			],
			cooldown: {
				time: 15000,
				type: "channel"
			},
			usage: "avatar [user]"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		if (!member) member = message.member;
		message.channel.send(new Discord.RichEmbed()
		.setTitle(`Avatar - ${member.user.tag}`)
		.setDescription(`Avatar URL: ${member.user.avatarURL}`)
		.setColor(Math.floor(Math.random() * 16777216))
		.setImage(member.user.avatarURL)
		);
	}
}

module.exports = AvatarCommand;
