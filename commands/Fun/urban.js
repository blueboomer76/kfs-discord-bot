const paginator = require("../../utils/paginator.js")
const superagent = require("superagent");

module.exports = {
	run: async (bot, message, args, flags) => {
		superagent.get("http://api.urbandictionary.com/v0/define")
		.query({term: args[0]})
		.end((err, res) => {
			if (!err && res.status == 200) {
				let defs = res.body;
				if (defs.list.length > 0) {
					let urbanEntries1 = [];
					let urbanEntries2 = [];
					for (let i = 0; i < defs.list.length; i++) {
						let def = defs.list[i].definition;
						if (def.length > 1000) def = def.slice(0, 1000) + "...";
						urbanEntries1.push(def);

						let example = defs.list[i].example;
						if (example.length > 1000) {
							example = example.slice(0, 1000) + "...";
						} else if (example.length == 0) {
							example = "No example given";
						}
						urbanEntries2.push(example);
					}
					let urbanEmbed = paginator.generateEmbed(1, urbanEntries1, urbanEntries2, 1, ["Definition", "Example"])
					message.channel.send(urbanEmbed
					.setAuthor("Urban Dictionary - " + args[0], "https://i.imgur.com/nwERwQE.jpg")
					)
					.then(newMessage => {
						if (defs.list[1]) {
							paginator.addPgCollector(message, newMessage, urbanEntries1, urbanEntries2, 1);
						}
					})
				} else {
					message.channel.send("No definition found for that term.");
				}
			} else {
				message.channel.send(`An error has occurred: ${err} (status code ${res.status})`);
			}
		});
	},
	commandInfo: {
		aliases: ["ud", "define"],
		args: [
			{
				allowQuotes: false,
				num: Infinity,
				optional: false,
				type: "string"
			}
		],
		category: "Fun",
		cooldown: {
			time: 15000,
			type: "user"
		},
		description: "Get definitions of a term from Urban Dictionary.",
		flags: null,
		guildOnly: true,
		name: "urban",
		perms: {
			bot: ["ADD_REACTIONS", "EMBED_LINKS", "MANAGE_MESSAGES"],
			user: null,
			level: 0
		},
		usage: "urban <term>"
	}
}
