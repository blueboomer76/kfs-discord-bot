const Discord = require("discord.js");
const superagent = require("superagent");

module.exports.run = async (bot, message, args) => {
	let {body} = await superagent
	.get(`https://random.dog/woof.json`);
	
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Here's your random dog!")
	.setColor(Math.floor(Math.random() * 16777216))
	.setFooter("From random.dog")
	.setImage(body.url)
	);
}

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