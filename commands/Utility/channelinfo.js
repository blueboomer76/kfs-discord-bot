const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const functions = require("../../modules/functions.js");

class ChannelInfoCommand extends Command {
	constructor() {
		super({
			name: "channelinfo",
			description: "Get info about a channel",
			aliases: ["channel"],
			args: [
				{
					num: 1,
					optional: true,
					type: "channel"
				}
			],
			category: "Utility",
			cooldown: {
				time: 15000,
				type: "channel"
			},
			guildOnly: true,
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0,
			},
			usage: "channelinfo [channel]"
		});
	}
	
	async run(bot, message, args, flags) {
		let channel = args[0];
		if (!args[0]) channel = message.channel;
		let createdDate = new Date(channel.createdTimestamp);
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Channel Info - #" + channel.name)
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter("ID: " + channel.id)
		.addField("Channel created at", `${createdDate.toUTCString()} (${functions.getDuration(createdDate)})`)
		.addField("Channel type", channel.type)
		);
		/*
			Others found:
			Can be accessed by everyone, disabled command(s) & features
		*/
	}
}

module.exports = ChannelInfoCommand;