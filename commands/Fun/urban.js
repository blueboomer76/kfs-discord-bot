const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const paginator = require("../../utils/paginator.js")
const superagent = require("superagent");

class UrbanCommand extends Command {
	constructor() {
		super({
			name: "urban",
			description: "Get definitions of a term from Urban Dictionary.",
			aliases: ["ud", "define"],
			args: [
				{
					errorMsg: "You need to provide a term to look up the Urban Dictionary!",
					num: Infinity,
					type: "string"
				}
			],
			category: "Fun",
			guildOnly: true,
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			},
			usage: "urban <term>"
		});
	}
	
	async run(bot, message, args, flags) {
		superagent.get(`http://api.urbandictionary.com/v0/define`)
		.query({term: args.join(" ")})
		.end((err, res) => {
			if (!err && res.status == 200) {
				let defs = res.body;
				if (defs.list.length > 0) {
					let urbanEntries1 = [];
					let urbanEntries2 = [];
					for (const entry of defs.list) {
						if (entry.definition.length > 1000) {
							urbanEntries1.push(entry.definition.slice(0,1000) + "...");
						} else {
							urbanEntries1.push(entry.definition);
						}
						if (entry.example.length > 1000) {
							urbanEntries2.push(entry.example.slice(0,1000) + "...");
						} else if (entry.example.length > 0) {
							urbanEntries2.push(entry.example);
						} else {
							urbanEntries2.push("No example given")
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
	}
	
	// generateEmbed(page, entries) {}
}

module.exports = UrbanCommand;