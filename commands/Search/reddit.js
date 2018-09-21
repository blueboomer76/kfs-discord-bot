const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const paginator = require("../../utils/paginator.js");
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
			cooldown: {
				time: 15000,
				type: "channel"
			},
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
			if (err) {return message.channel.send(`Failed to retrieve from Reddit. (status code ${res.statusCode})`)}
			const $ = cheerio.load(res.body);
			
			let subredditArray;
			if (!args[0]) {
				subredditArray = $("[data-click-id]").toArray().filter(e => {
					return e.children[0].data && e.children[0].data.startsWith("r/")
				}).map(e => {
					return e.children[0].data;
				})
			}
			
			let voteArray = $("[data-click-id='upvote'] + div").toArray().map(e => {return e.children[0].data});
			
			let titleElements = $("[data-click-id='body'] h2").toArray();
			let titleArray = titleElements.map(e => {return e.children[0].data});
			let linkArray = titleElements.map(e => {return `https://reddit.com${e.parent.attribs.href}`});
			
			let displayed = [], entries = [[]];
			for (let i = 0; i < titleArray.length; i++) {
				let toDisplay = `[${titleArray[i]}](${linkArray[i]})`;
				if (!args[0]) {toDisplay += ` (${subredditArray[i]})`}
				entries[0].push(toDisplay + `\n - Votes: ${voteArray[2*i]}`);
			}
			entries[0] = entries[0].slice($(".Post .icon-sticky").length)
			
			paginator.paginate(message, {
				title: args[0] ? `Reddit - r/${args[0]}` : "Reddit - all subreddits",
				thumbnail: {
					url: "https://www.redditstatic.com/new-icon.png"
				}
			}, entries, {
				limit: 5,
				numbered: true,
				page: 1,
				params: null
			});
		})
	}
}

module.exports = RedditCommand;