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
			if (err) return message.channel.send(`Could not request to random.dog: ${err.message}`);
			if (!res) return message.channel.send("No response was received from random.dog.");
			if (res.statusCode >= 400) return message.channel.send(`The request to random.dog failed with status code ${res.statusCode} (${res.statusMessage})`);
			message.channel.send(new Discord.RichEmbed()
			.setTitle("Here's your random dog!")
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter("From random.dog")
			.setImage(JSON.parse(res.body).url)
			);
		})
	}
}

module.exports = DogCommand;
