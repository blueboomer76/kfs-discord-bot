const Discord = require("discord.js");
const fList = require("../../modules/functions.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		let channel = args[0];
		if (!args[0]) channel = message.channel;
		let createdDate = new Date(channel.createdTimestamp);
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Channel Info - " + channel.name)
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter("ID: " + channel.id)
		.addField("Channel created at", `${createdDate.toUTCString()} (${fList.getDuration(createdDate)})`)
		.addField("Channel type", channel.type)
		);
		/*
			Others found:
			Can be accessed by everyone, disabled command(s) & features
		*/
	},
	commandInfo: {
		aliases: ["channel"],
		args: [
			{
				allowQuotes: false,
				num: Infinity,
				optional: true,
				type: "channel"
			}
		],
		category: "Utility",
		cooldown: {
			time: 15000,
			type: "channel"
		},
		description: "Get info about a channel",
		flags: null,
		guildOnly: true,
		name: "channel",
		perms: {
			bot: ["EMBED_LINKS"],
			user: null,
			level: 0
		},
		usage: "channelinfo [channel]"
	}
}
