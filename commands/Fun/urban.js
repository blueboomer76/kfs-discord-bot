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
			flags: [
				{
					name: "page",
					arg: {
						num: 1,
						type: "number",
						min: 1,
						max: 10
					}
				}
			],
			guildOnly: true,
			perms: {
				bot: ["EMBED_LINKS", "MANAGE_MESSAGES"],
				user: [],
				level: 0
			},
			usage: "urban <term> [--page <number>]"
		});
	}
	
	async run(bot, message, args, flags) {
		let pageFlag = flags.find(f => f.name == "page"), startPage;
		if (pageFlag) {startPage = pageFlag.args[0]} else {startPage = 1};
		superagent.get(`http://api.urbandictionary.com/v0/define`)
		.query({term: args.join(" ")})
		.end((err, res) => {
			if (!err && res.status == 200) {
				let defs = res.body;
				if (defs.list.length > 0) {
					let urbanEntries = [
						defs.list.map(def => {
							return {
								name: `Urban Dictionary - ${def.word}`,
								icon_url: "https://i.imgur.com/nwERwQE.jpg"
							}
						}),
						defs.list.map(def => {
							let example = "No example given";
							if (def.example.length > 1000) {
								example = `${def.example.slice(0,1000)}...`
							} else if (def.example.length > 0) {
								example = def.example
							}
							return [
								{
									name: "Definition",
									value: def.definition.length > 1000 ? `${def.definition.slice(0,1000)}...` : def.definition
								},
								{
									name: "Example",
									value: def.example
								},
								{
									name: "Rating",
									value: `👍 ${def.thumbs_up} | 👎 ${def.thumbs_down}`
								}
							]
						})
					];
					let urbanEmbed = paginator.generateEmbed(startPage, urbanEntries, 1, ["author", "fields"]);
					message.channel.send("", {embed: urbanEmbed})
					.then(newMessage => {
						if (defs.list[1]) {
							paginator.addPgCollector(message, newMessage, urbanEntries, 1, ["author", "fields"])
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
}

module.exports = UrbanCommand;