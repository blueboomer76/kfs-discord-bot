const Command = require("../../structures/command.js");
const paginator = require("../../utils/paginator.js");
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
					desc: "The page to go to",
					arg: {
						type: "number",
						min: 1,
						max: 10
					}
				}
			],
			perms: {
				bot: ["ADD_REACTIONS", "EMBED_LINKS", "MANAGE_MESSAGES"],
				user: [],
				level: 0
			},
			usage: "urban <term> [--page <number>]"
		});
	}
	
	async run(bot, message, args, flags) {
		request.get({
			url: "http://api.urbandictionary.com/v0/define",
			qs: {term: args[0]},
		}, (err, res) => {
			if (err) return message.channel.send(`Could not request to the Urban Dictionary: ${err.message}`);
			if (!res) return message.channel.send("No response was received from the Urban Dictionary.");
			if (res.statusCode >= 400) return message.channel.send(`The request to the Urban Dictionary failed with status code ${res.statusCode} (${res.statusMessage})`);
			
			let defs = JSON.parse(res.body);
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
								value: def.definition.length > 1000 ? `${def.definition.slice(0, 1000)}...` : def.definition
							},
							{
								name: "Example",
								value: def.example.length > 0 ? (def.example.length > 1000 ? `${def.example.slice(0, 1000)}...` : def.example) : "No example given"
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
				let pageFlag = flags.find(f => f.name == "page"), startPage;
				paginator.paginate(message, {}, entries, {
					limit: 1,
					numbered: false,
					page: pageFlag ? pageFlag.args : 1,
					params: ["author", "fields"]
				});
			} else {
				message.channel.send("No definition found for that term.");
			}
		})
	}
}

module.exports = UrbanCommand;
