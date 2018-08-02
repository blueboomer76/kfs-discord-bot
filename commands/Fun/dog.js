const Discord = require("discord.js");
const superagent = require("superagent");

module.exports = {
	run: async (bot, message, args, flags) => {
		let {body} = await superagent
		.get(`https://random.dog/woof.json`);
  
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Here's your random dog!")
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter("From random.dog")
		.setImage(body.url)
		);
	},
	commandInfo: {
		aliases: ["woof", "puppy"],
		args: null,
		category: "Fun",
		cooldown: {
			time: 15000,
			type: "channel"
		},
		description: "Get a random dog!",
		flags: null,
		guildOnly: true,
		name: "dog",
		perms: {
			bot: ["EMBED_LINKS"],
			user: null,
			level: 0,
		},
		usage: "dog"
	}
}

// Deprecated command info
module.exports.config = {
	aliases: ["woof", "puppy"],
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
	name: "dog",
	category: "Fun",
	description: "Get a random dog!",
	usage: "k,dog"
}