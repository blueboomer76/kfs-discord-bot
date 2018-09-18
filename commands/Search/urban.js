const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const paginator = require("../../utils/paginator.js")
const request = require("request");

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
		request({
			url: `http://api.urbandictionary.com/v0/define`,
			qs: {term: args.join(" ")}
		}, (error, response, body) => {
			if (error) return message.channel.send(`Failed to retrieve from the Urban Dictionary. (status code ${response.statusCode})`)
			let defs = JSON.parse(body);
			if (defs.list.length > 0) {
				let entries = [
					defs.list.map(def => {
						return {
							name: `Urban Dictionary - ${def.word}`,
							icon_url: "https://i.imgur.com/nwERwQE.jpg"
						}
					}),
					defs.list.map(def => {
						return [
							{
								name: "Definition",
								value: def.definition.length > 1000 ? `${def.definition.slice(0,1000)}...` : def.definition
							},
							{
								name: "Example",
								value: def.example.length > 0 ? (def.example.length < 1000 ? def.example : `${def.example.slice(0,1000)}...`) : "No example given"
							},
							{
								name: "By",
								value: def.author,
								inline: true
							},
							{
								name: "Rating",
								value: `👍 ${def.thumbs_up} / 👎 ${def.thumbs_down}`,
								inline: true
							}
						]
					})
				];
				let urbanEmbed = {};
				paginator.paginate(message, urbanEmbed, entries, {
					limit: 1,
					numbered: false,
					page: startPage,
					params: ["author", "fields"]
				});
			} else {
				message.channel.send("No definition found for that term.")
			}
		})
	}
}

module.exports = UrbanCommand;