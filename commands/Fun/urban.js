const Discord = require("discord.js");
const paginator = require("../../utils/paginator.js")
const superagent = require("superagent");

module.exports = {
	run: async (bot, message, args, flags) => {
		if (!args[0]) return message.channel.send("You need to provide a term to look up the Urban Dictionary!")
		superagent.get(`http://api.urbandictionary.com/v0/define`)
		.query({term: args.join(" ")})
		.end((err, res) => {
			if (!err && res.status == 200) {
				var defs = res.body;
				if (defs.list.length > 0) {
					let urbanEntries1 = [];
					let urbanEntries2 = [];
					for (let i = 0; i < defs.list.length; i++) {
						if (defs.list[i].definition.length > 1000) {
							urbanEntries1.push(defs.list[i].definition.slice(0,1000) + "...");
						} else {
							urbanEntries1.push(defs.list[i].definition);
						}
						if (defs.list[i].example.length > 1000) {
							urbanEntries2.push(defs.list[i].example.slice(0,1000) + "...");
						} else if (defs.list[i].example.length > 0) {
							urbanEntries2.push(defs.list[i].example);
						} else {
							urbanEntries2.push("No example given.")
						}
					}
					let urbanEmbed = paginator.generateEmbed(1, urbanEntries1, urbanEntries2, 1, ["Definition", "Example"])
					message.channel.send(urbanEmbed
					.setAuthor("Urban Dictionary - " + args.join(" "), "https://i.imgur.com/nwERwQE.jpg")
					)
					.then(newMessage => {
						if (defs.list[1]) {
							paginator.addPgCollector(message, newMessage, urbanEntries1, urbanEntries2, 1, ["Definition", "Example"])
						}
					})
				} else {
					message.channel.send("No definition found for that term.")
				}
			} else {
				message.channel.send(`An error has occurred: ${err} (status code ${res.status})`)
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
			bot: ["EMBED_LINKS"],
			user: null,
			level: 0,
		},
		usage: "urban <term>"
	}
}