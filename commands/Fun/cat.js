const Discord = require("discord.js");
const superagent = require("superagent");

module.exports = {
	run: async (bot, message, args, flags) => {
		let {body} = await superagent
		.get(`http://aws.random.cat/meow`);
	  
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Here's your random cat!")
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter("From random.cat")
		.setImage(body.file)
		);
	},
	commandInfo: {
		aliases: ["kitten", "meow"],
		args: null,
		category: "Fun",
		cooldown: {
			time: 15000,
			type: "channel"
		},
		description: "Get a random cat!",
		flags: null,
		guildOnly: true,
		name: "cat",
		perms: {
			bot: ["EMBED_LINKS"],
			user: null,
			level: 0,
		},
		usage: "cat"
	}
}

// Deprecated command info
module.exports.config = {
	aliases: ["kitten", "meow"],
	cooldown: {
		waitTime: 15000,
		type: "channel"
	},
	guildOnly: true,
	perms: {
		level: 0,
		reqPerms: null
	}
}

module.exports.help = {
	name: "cat",
	category: "Fun",
	description: "Get a random cat!",
	usage: "k,cat"
}