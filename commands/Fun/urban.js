const Discord = require("discord.js");
const superagent = require("superagent");

module.exports.run = async (bot, message, args) => {
	if (!args[0]) return message.channel.send("You need to provide a term to look up the Urban Dictionary!")
	superagent.get(`http://api.urbandictionary.com/v0/define`)
	.query({term: args.join(" ")})
	.end((err, res) => {
		if (!err && res.status == 200) {
			var defs = res.body;
			if (defs.result_type != "no_results") {
				let uEmbed = new Discord.RichEmbed()
				.setAuthor("Urban Dictionary - " + args.join(" "), "https://i.imgur.com/nwERwQE.jpg")
				.setColor(Math.floor(Math.random() * 16777216))
				.setDescription(defs.list[0].definition)
				.addField("Example", defs.list[0].example)
				if (defs.list[1]) {
					if (defs.list[1].definition.length > 1000) {
						uEmbed.addField("Another Definition", defs.list[1].definition.slice(0, 1000) + "...")
					} else {
						uEmbed.addField("Another Definition", defs.list[1].definition)
					}
					uEmbed.addField("Another Example", defs.list[1].example)
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
	aliases: ["ud"],
	cooldown: {
		waitTime: 15000,
		type: "user"
	},
	guildOnly: false,
	perms: {
		level: 0,
		reqPerms: null
	}
}

module.exports.help = {
	name: "urban",
	category: "Fun",
	description: "Get definitions of a term from Urban Dictionary.",
	usage: "k,urban <term>"
}