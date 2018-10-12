const Discord = require("discord.js");
const Command = require("../structures/command.js");
const paginator = require("../utils/paginator.js");
const request = require("request");
const cheerio = require("cheerio");

module.exports = [
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
					bot: ["EMBED_LINKS", "MANAGE_MESSAGES"],
					user: [],
					level: 0
				},
				startTyping: true,
				usage: "reddit [subreddit]"
			});
		}
		
		async run(bot, message, args, flags) {
			let url = "https://reddit.com/r/";
			if (args[0]) {url += args[0].replace(/^\/?(R|r)\//, "")} else {url += "all"}
			request.get(url, (err, res) => {
				if (res.statusCode == 404) return message.channel.send("That subreddit doesn't exist!")
				if (err || res.statusCode >= 400) {return message.channel.send(`Failed to retrieve from Reddit. (status code ${res.statusCode})`)}
				const $ = cheerio.load(res.body);
				
				let viewAll = false;
				if (!args[0] || args[0] == "all" || args[0] == "popular") viewAll = true;
				
				let postElements = $(".Post:not(:has(span:contains('promoted'), .icon-sticky))"), subredditArray;
				if (viewAll) {
					subredditArray = postElements.map((i, e) => {
						let subreddit = $(e).find("[data-click-id='subreddit']").attr("href");
						return subreddit.slice(1, subreddit.length - 1);
					}).toArray();
				}
				
				let titleArray = postElements.map((i, e) => {
						let dispTitle = $(e).find("h2").text();
						return dispTitle.length < 200 ? dispTitle : `${dispTitle.slice(0,200)}...`
					}).toArray(),
					authorArray = postElements.map((i, e) => {
						return $(e).find("a[href^='/user/']").text()
					}).toArray(),
					timeArray = postElements.map((i, e) => {
						return $(e).find("[data-click-id='timestamp']").text()
					}).toArray(),
					linkArray = postElements.map((i, e) => {
						return $(e).find("a[data-click-id='body']").attr("href")
					}).toArray(),
					voteArray = postElements.map((i, e) => {
						return $(e).find("[data-click-id='upvote']").next().html()
					}).toArray(),
					commentArray = postElements.map((i, e) => {
						return $(e).find("[data-click-id='comments'] span").text().replace(/ comments?/, "").replace("comment", 0)
					}).toArray();

				let entries = [[]];
				for (let i = 0; i < titleArray.length; i++) {
					let toDisplay = `[${titleArray[i]}](https://reddit.com${linkArray[i]})`;
					if (viewAll) toDisplay += ` (${subredditArray[i]})`
					entries[0].push(toDisplay + `\n - 👍 ${voteArray[i]} | 💬 ${commentArray[i]} | ${authorArray[i]} | ${timeArray[i]}`);
				}
				
				let embedTitle = "Reddit - ";
				if (args[0] == "random") {
					embedTitle += "Random subreddit!";
				} else if (viewAll) {
					embedTitle += "All subreddits"
				} else {
					embedTitle += `r/${args[0]}`;
				}
				
				paginator.paginate(message, {
					title: embedTitle,
					thumbnail: {
						url: "https://www.redditstatic.com/new-icon.png"
					}
				}, entries, {
					limit: 5,
					noStop: viewAll ? true : false,
					numbered: true,
					page: 1,
					params: null
				});
			})
		}
	},
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
							num: 1,
							type: "number",
							min: 1,
							max: 10
						}
					}
				],
				perms: {
					bot: ["EMBED_LINKS", "MANAGE_MESSAGES"],
					user: [],
					level: 0
				},
				startTyping: true,
				usage: "urban <term> [--page <number>]"
			});
		}
		
		async run(bot, message, args, flags) {
			request.get({
				url: `http://api.urbandictionary.com/v0/define`,
				qs: {term: args.join(" ")}
			}, (err, res) => {
				if (err || res.statusCode >= 400) return message.channel.send(`Failed to retrieve from the Urban Dictionary. (status code ${res.statusCode})`)
				let defs = JSON.parse(res.body);
				if (defs.list.length > 0) {
					let entries = [
						defs.list.map(def => `Urban Dictionary - ${def.word}`),
						defs.list.map(def => def.definition.length < 2000 ? def.definition : `${def.definition.slice(0,2000)}...`),
						defs.list.map(def => {
							return [
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
					let pageFlag = flags.find(f => f.name == "page");
					paginator.paginate(message, {
						thumbnail: {url: "https://i.imgur.com/Bg54V46.png"}
					}, entries, {
						limit: 1,
						numbered: false,
						page: pageFlag ? pageFlag.args[0] : 1,
						params: ["title", "description", "fields"]
					});
				} else {
					message.channel.send("No definition found for that term.")
				}
			})
		}
	}
];