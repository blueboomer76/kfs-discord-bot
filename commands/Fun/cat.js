const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const request = require("request");

class CatCommand extends Command {
	constructor() {
		super({
			name: "cat",
			description: "Get a random cat!",
			aliases: ["kitten", "meow"],
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
		request.get("http://aws.random.cat/meow", (err, res) => {
			if (err) return message.channel.send(`Could not request to random.cat: ${err.message}`);
			if (!res) return message.channel.send("No response was received from random.cat.");
			if (res.statusCode >= 400) return message.channel.send(`The request to random.cat failed with status code ${res.statusCode} (${res.statusMessage})`);
			message.channel.send(new Discord.RichEmbed()
			.setTitle("Here's your random cat!")
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter("From random.cat")
			.setImage(JSON.parse(res.body).file)
			);
		})
	}
}

module.exports = CatCommand;
