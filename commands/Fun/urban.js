const Discord = require("discord.js");
const superagent = require("superagent");

module.exports.run = async (bot, message, args) => {
	superagent.get(`http://api.urbandictionary.com/v0/define`)
	.query({term: args.toString().replace(/\,/g, " ")})
	.end((err, res) => {
		if (!err && res.status == 200) {
			var defs = res.body;
			if (defs.result_type != "no_results") {
				let uEmbed = new Discord.RichEmbed()
				.setTitle("Urban dictionary definitions for " + args)
				.setColor(Math.floor(Math.random() * 16777216))
				.addField("Definition", defs.list[0].definition)
				.addField("Example", defs.list[0].example)
				if (defs.list[1]) {
					uEmbed.addField("Definition", defs.list[1].definition)
					.addField("Example", defs.list[1].example)
				}
				message.channel.send(uEmbed);
			} else {
				message.channel.send("No definition found for that term.")
			} 
		} else {
			message.channel.send(`An error has occurred: ${err} (status code ${res.status})`)
		}
	});
}

module.exports.config = {
	"aliases": null,
	"cooldown": {
		"waitTime": 15000,
		"type": "user"
	},
	"guildOnly": false,
	"perms": {
		"level": 0,
		"reqPerms": null
	}
}

module.exports.help = {
	"name": "urban",
	"category": "Fun",
	"description": "Get definitions of a term from Urban Dictionary.",
	"usage": "k,urban <term>"
}