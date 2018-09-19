const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const request = require("request");

class DogCommand extends Command {
	constructor() {
		super({
			name: "dog",
			description: "Get a random dog!",
			aliases: ["puppy", "woof"],
			cooldown: {
				time: 15000,
				type: "channel"
			},
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			}
		});
	}
	
	async run(bot, message, args, flags) {
		request.get("http://random.dog/woof.json", (err, res) => {
			if (err) {return message.channel.send(`Failed to retrieve from random.dog. (status code ${res.statusCode})`)}
			message.channel.send(new Discord.RichEmbed()
			.setTitle("Here's your random dog!")
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter("From random.dog")
			.setImage(JSON.parse(res.body).url)
			);
		});
	}
}

module.exports = DogCommand;