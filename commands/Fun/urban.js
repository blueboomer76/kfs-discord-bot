const Discord = require("discord.js");
const superagent = require("superagent");

module.exports.run = async (bot, message, args) => {
	if (args.length == 0) return message.channel.send("You need to provide a term to look up the Urban Dictionary!");
	var argstext = args.join(" ");
	superagent.get("http://api.urbandictionary.com/v0/define")
	.query({term: argstext})
	.end((err, res) => {
		if (!err && res.status == 200) {
			let defs = res.body;
			if (defs.list.length > 0) {
				let def1 = defs.list[0].definition;
				if (def1.length > 2000) def1 = def1.slice(0, 2000) + "...";
				let example1 = defs.list[0].example;
				if (example1.length > 1000) {
					example1 = example1.slice(0, 1000) + "...";
				} else if (example1.length == 0) {
					example1 = "No example given";
				}
				let uEmbed = new Discord.RichEmbed()
				.setDescription(def1)
				.setAuthor("Urban Dictionary - " + argstext, "https://i.imgur.com/nwERwQE.jpg")
				.setColor(Math.floor(Math.random() * 16777216))
				.addField("Example", example1)
				if (defs.list[1]) {
					let def2 = defs.list[1].definition;
					if (def2.length > 1000) def2 = def2.slice(0, 1000) + "...";
					let example2 = defs.list[1].example;
					if (example2.length > 1000) {
						example2 = example2.slice(0, 1000) + "...";
					} else if (example2.length == 0) {
						example2 = "No example given";
					}
					uEmbed.addField("Another Definition", def2)
					.addField("Another Example", example2)
				}
				message.channel.send(uEmbed);
			} else {
				message.channel.send("No definition found for that term.");
			} 
		} else {
			message.channel.send(`An error has occurred: ${err} (status code ${res.status})`);
		}
	});
}

module.exports.config = {
	aliases: ["ud"],
	cooldown: {
		waitTime: 15000,
		type: "user"
	},
	guildOnly: true,
	perms: {
		level: 0,
		reqEmbed: true,
		reqPerms: null
	}
}

module.exports.help = {
	name: "urban",
	category: "Fun",
	description: "Get definitions of a term from Urban Dictionary.",
	usage: "urban <term>"
}
