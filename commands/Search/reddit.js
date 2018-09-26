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
			if (err || res.statusCode >= 400) {return message.channel.send(`Failed to retrieve from Reddit. (status code ${res.statusCode})`)}
			const $ = cheerio.load(res.body);
			
			let postElements = $(".Post:not(:has(span:contains('promoted'), .icon-sticky))")
			
			let subredditArray;
			if (!args[0]) {
				subredditArray = postElements.map((i, e) => {
					let subreddit = $(e).find("[data-click-id='subreddit']").attr("href");
					return subreddit.slice(1, subreddit.length - 1);
				}).toArray()
			}
			
			let titleArray = postElements.map((i, e) => {
				let dispTitle = $(e).find("h2").text();
				return dispTitle.length > 250 ? `dispTitle.slice(0,250)...` : dispTitle;
			}).toArray();
			let linkArray = postElements.map((i, e) => {
				return $(e).find("a[data-click-id='body']").attr("href")
			}).toArray();
			let voteArray = postElements.map((i, e) => {
				return $(e).find("[data-click-id='upvote']").next().html()
			}).toArray();
			let commentArray = postElements.map((i, e) => {
				return $(e).find("[data-click-id='comments'] span").text().replace(/comments?/, "")
			}).toArray();

			let entries = [[]];
			for (let i = 0; i < titleArray.length; i++) {
				let toDisplay = `[${titleArray[i]}](https://reddit.com${linkArray[i]})`;
				if (!args[0]) {toDisplay += ` (${subredditArray[i]})`}
				entries[0].push(toDisplay + `\n - 👍 ${voteArray[i]} | 💬 ${commentArray[i]}`);
			}
			
			let embedTitle = "Reddit - ";
			if (args[0] == "random") {
				embedTitle += "Random subreddit!";
			} else if (args[0]) {
				embedTitle += `r/${args[0]}`;
			} else {
				embedTitle += "All subreddits"
			}
			paginator.paginate(message, {
				title: embedTitle,
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