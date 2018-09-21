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
					num: Infinity,
					optional: true,
					type: "channel"
				}
			],
			cooldown: {
				time: 15000,
				type: "channel"
			},
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			},
			usage: "channelinfo [channel]"
		});
	}
	
	async run(bot, message, args, flags) {
		let channel = args[0] ? args[0] : message.channel;
		let createdDate = new Date(channel.createdTimestamp);
		let channelEmbed = new Discord.RichEmbed()
		.setTitle(`Channel Info - ${channel.name}`)
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter(`ID: ${channel.id}`)
		.addField("Channel created at", `${createdDate.toUTCString()} (${functions.getDuration(createdDate)})`)
		.addField("Channel type", channel.type)
		.addField("Has permission overwrites", channel.permissionOverwrites.size == 0 ? "No" : "Yes")
		if (channel.type == "text") {
			channelEmbed.addField("Topic", channel.topic ? channel.topic : "No topic set");
		}

		message.channel.send(channelEmbed);

		/*
			Others found:
			Can be accessed by everyone, disabled command(s) & features
		*/
	}
}

module.exports = ChannelInfoCommand;
