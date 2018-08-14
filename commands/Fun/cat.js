const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const superagent = require("superagent");

class CatCommand extends Command {
	constructor() {
		super({
			name: "cat",
			description: "Get a random cat!",
			aliases: ["kitten", "meow"],
			category: "Fun",
			cooldown: {
				time: 15000,
				type: "channel"
			},
			guildOnly: true,
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			}
		});
	}
	
	async run(bot, message, args, flags) {
		let {body} = await superagent
		.get("http://aws.random.cat/meow");
	  
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Here's your random cat!")
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter("From random.cat")
		.setImage(body.file)
		);
	}
}

module.exports = CatCommand;
