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
			cooldown: {
				time: 15000,
				type: "channel"
			},
			usage: "avatar [user]"
		});
	}
	
	async run(bot, message, args, flags) {
		let member = args[0];
		let avatarURL = member.user.avatarURL ? member.user.avatarURL : `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`
		if (!member) member = message.member;
		message.channel.send(new Discord.RichEmbed()
		.setTitle(`Avatar - ${member.user.tag}`)
		.setColor(Math.floor(Math.random() * 16777216))
		.setDescription(`Avatar URL: ${avatarURL}`)
		.setImage(avatarURL)
		);
	}
}

module.exports = AvatarCommand;