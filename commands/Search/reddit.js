const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const request = require("request");
const cheerio = require("cheerio");

class RedditCommand extends Command {
	constructor() {
		super({
			name: "reddit",
			description: "Get top posts from Reddit, from all subreddits or a single one",
			args: [
				{
					num: Infinity,
					optional: true,
					type: "string"
				}
			],
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			},
			startTyping: true,
			usage: "reddit [subreddit]"
		});
	}
	
	async run(bot, message, args, flags) {
		let url = "https://reddit.com";
		if (args[0]) url += `/r/${args[0].replace(/\/?(R|r)\//, "")}`;
		request.get(url, (err, res) => {
			if (res.statusCode == 404) return message.channel.send("That subreddit doesn't exist!")
			if (err) {return message.channel.send(`Failed to retrieve from Reddit. (status code ${response.statusCode})`)}
			const $ = cheerio.load(res.body);
			
			let subredditArray;
			if (!args[0]) {
				subredditArray = $("[data-click-id]").toArray().filter(e => {
					return e.children[0].data && e.children[0].data.startsWith("r/")
				}).map(e => {
					return e.children[0].data;
				})
			}
			
			// console.log($("[data-click-id='body'] h2").toArray()[0])
			
			let voteArray = $("[style='color:#1A1A1B']").toArray().map(e => {return e.children[0].data});
			let titleElements = $("[data-click-id='body'] h2").toArray();
			let titleArray = titleElements.map(e => {return e.children[0].data});
			let linkArray = titleElements.map(e => {return `https://reddit.com${e.parent.attribs.href}`});
			
			let displayed = [];
			for (let i = 0; i < 5; i++) {
				let toDisplay = `${i+1}. [${titleArray[i]}](${linkArray[i]})`;
				if (!args[0]) {toDisplay += ` (${subredditArray[i]})`}
				displayed.push(toDisplay + `\n - Votes: ${voteArray[2*i]}`);
			}
			
			message.channel.send(new Discord.RichEmbed()
			.setTitle(args[0] ? `Reddit - r/${args[0]}` : "Reddit - all subreddits")
			.setColor(16728064)
			.setDescription(displayed.join("\n"))
			)
		})
	}
}

module.exports = RedditCommand;