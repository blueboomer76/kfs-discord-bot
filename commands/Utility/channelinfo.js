const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const {capitalize, getDuration} = require("../../modules/functions.js");

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
		.addField("Created at", `${createdDate.toUTCString()} (${getDuration(createdDate)})`)
		.addField("Type", capitalize(channel.type), true)
		.addField("Category Parent", channel.parent ? channel.parent.name : "None", true)
		.addField("Has permission overwrites", channel.permissionOverwrites.size == 0 ? "No" : "Yes", true)
		
		if (channel.type == "text") {
			channelEmbed.addField("Topic", channel.topic ? channel.topic : "No topic set");
		} else if (channel.type == "voice") {
			channelEmbed.addField("User Limit", channel.userLimit == 0 ? "No limit" : channel.userLimit, true)
			.addField("Bitrate", `${channel.bitrate} bits`, true)
		}

		message.channel.send(channelEmbed);
	}
}

module.exports = ChannelInfoCommand;
