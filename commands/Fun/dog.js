const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const superagent = require("superagent");

class DogCommand extends Command {
	constructor() {
		super({
			name: "dog",
			description: "Get a random dog!",
			aliases: ["puppy", "woof"],
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
		.get("http://random.dog/woof.json");
	  
		message.channel.send(new Discord.RichEmbed()
		.setTitle("Here's your random dog!")
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter("From random.dog")
		.setImage(body.file)
		);
	}
}

module.exports = DogCommand;