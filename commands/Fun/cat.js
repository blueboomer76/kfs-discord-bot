const Discord = require("discord.js");
const superagent = require("superagent");

module.exports.run = async (bot, message, args) => {
	let {body} = await superagent
	.get(`http://aws.random.cat/meow`);
	
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Here's your random cat!")
	.setColor(Math.floor(Math.random() * 16777216))
	.setFooter("From random.cat")
	.setImage(body.file)
	);
}

module.exports.config = {
	aliases: ["kitten", "meow"],
	cooldown: {
		waitTime: 15000,
		type: "channel"
	},
	guildOnly: true,
	perms: {
		level: 0,
		reqPerms: []
	}
}

module.exports.help = {
	name: "cat",
	category: "Fun",
	description: "Get a random cat!",
	usage: "k,cat"
}