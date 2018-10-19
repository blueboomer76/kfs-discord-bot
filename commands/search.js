const Discord = require("discord.js");
const Command = require("../structures/command.js");
const request = require("request");
const paginator = require("../utils/paginator.js");
const {getDuration} = require("../modules/functions.js");

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
				examples: [
					"reddit funny",
					"reddit aww --compact",
					"reddit gaming --more"
				],
				flags: [
					{
						name: "compact",
						desc: "Whether to compact the displayed posts"
					},
					{
						name: "more",
						desc: "Whether to see more posts at a time"
					}
				],
				perms: {
					bot: ["EMBED_LINKS", "MANAGE_MESSAGES"],
					user: [],
					level: 0
				},
				usage: "reddit [subreddit] [--compact] [--more]"
			});
		}
		
		async run(bot, message, args, flags) {
			let subreddit, compact = false;
			if (args[0]) {subreddit = args[0].replace(/^\/?(R|r)\//, "")} else {subreddit = "all"};
			if (flags.find(f => f.name == "compact")) compact = true;
			let numToDisplay = compact ? 50 : 25;
			
			request.get({
				url: `https://reddit.com/r/${subreddit}/hot.json`,
				qs: {limit: flags.find(f => f.name == "more") ? numToDisplay * 2 : numToDisplay},
				json: true
			}, (err, res) => {
				if (err || res.statusCode >= 400) return message.channel.send(`Failed to retrieve from Reddit. (status code ${res.statusCode})`)
				
				let results = res.body.data.children.filter(r => !r.data.stickied);
				if (!message.channel.nsfw) results = results.filter(r => !r.data.over_18);
				if (results.length == 0) return message.channel.send("No results found.")
				
				let entries = [[]], viewAll = false;
				if (!args[0] || args[0] == "all" || args[0] == "popular") viewAll = true;
				
				if (compact) {
					for (const post of results) {
						let postData = post.data,
							postTitle = postData.title.length < 175 ? postData.title : `${postData.title.slice(0,150)}...`,
							toDisplay = `[${postTitle.replace(/&amp;/g, "&")}](https://redd.it/${postData.id})`;
						if (viewAll) toDisplay += ` (${postData.subreddit_name_prefixed})`
						entries[0].push(toDisplay);
					}
				} else {
					for (const post of results) {
						let postData = post.data,
							postTitle = postData.title.length < 250 ? postData.title : `${postData.title.slice(0,200)}...`,
							toDisplay = `[${postTitle.replace(/&amp;/g, "&")}](https://redd.it/${postData.id})`;
						if (viewAll) toDisplay += ` (${postData.subreddit_name_prefixed})`
						let postFlair = postData.link_flair_text;
						if (postFlair) toDisplay += ` [${postData.link_flair_text}]`
						
						entries[0].push(`${toDisplay}\n - 👍 ${postData.score} | 💬 ${postData.num_comments} | u/${postData.author} | ${getDuration(postData.created_utc * 1000, null, true)}`);
					}
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
					limit: compact ? 10 : 5,
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