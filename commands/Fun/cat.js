const Discord = require("discord.js");
const superagent = require("superagent");

module.exports.run = async (bot, message, args) => {
	let {body} = await superagent
	.get("http://aws.random.cat/meow");
	
	message.channel.send(new Discord.RichEmbed()
	.setTitle("Here's your random cat!")
	.setColor(Math.floor(Math.random() * 16777216))
	.setFooter("From random.cat")
	.setImage(body.file)
	);
}

module.exports.help = {
	"name": "cat"
}
