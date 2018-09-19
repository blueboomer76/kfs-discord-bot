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
			guildOnly: true,
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			}
		});
	}
	
	async run(bot, message, args, flags) {
		request.get("http://aws.random.cat/meow", (err, res) => {
			if (err) return message.channel.send(`Failed to retrieve from random.cat. (status code ${res.statusCode})`)
			message.channel.send(new Discord.RichEmbed()
			.setTitle("Here's your random cat!")
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter("From random.cat")
			.setImage(JSON.parse(res.body).file)
			);
		});
	}
}

module.exports = CatCommand;