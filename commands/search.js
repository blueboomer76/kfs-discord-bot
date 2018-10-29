const Discord = require("discord.js");
const Command = require("../structures/command.js");
const {getDuration} = require("../modules/functions.js");
const paginator = require("../utils/paginator.js");
const request = require("request");

module.exports = [
	class RedditCommand extends Command {
		constructor() {
			super({
				name: "reddit",
				description: "Get top posts from Reddit, from all subreddits or a single one",
				args: [
					{
						infiniteArgs: true,
						optional: true,
						type: "string"
					}
				],
				cooldown: {
					time: 20000,
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
					bot: ["ADD_REACTIONS", "EMBED_LINKS", "MANAGE_MESSAGES"],
					user: [],
					level: 0
				},
				usage: "reddit [subreddit] [--compact] [--more]"
			});
		}
		
		async run(bot, message, args, flags) {
			let subreddit, compact = false;
			if (args[0]) {subreddit = args[0].replace(/^\/?[Rr]\//, "")} else {subreddit = "all"}
			if (flags.find(f => f.name == "compact")) compact = true;
			let numToDisplay = compact ? 50 : 25;
			
			request.get({
				url: `https://reddit.com/r/${subreddit}/hot.json`,
				qs: {limit: flags.find(f => f.name == "more") ? numToDisplay * 2 : numToDisplay},
				json: true
			}, (err, res) => {
				if (err) return message.channel.send(`Could not request to Reddit: ${err.message}`);
				if (!res) return message.channel.send("No response was received from Reddit.");
				if (res.statusCode == 404) return message.channel.send("That subreddit doesn't exist!");
				if (res.statusCode == 403) return message.channel.send("That subreddit is private.");
				if (res.statusCode >= 400) return message.channel.send(`The request to Reddit failed with status code ${res.statusCode} (${res.statusMessage})`);
				
				let results = res.body.data.children.filter(r => !r.data.stickied);
				if (!message.channel.nsfw) results = results.filter(r => !r.data.over_18);
				if (results.length == 0) return message.channel.send("No results found.");
				
				let entries = [[]], viewAll = false;
				if (!args[0] || args[0] == "all" || args[0] == "popular") viewAll = true;
				
				if (compact) {
					for (const post of results) {
						let postData = post.data,
							postTitle = postData.title.length > 150 ? `${postData.title.slice(0, 150)}...` : postData.title;
							toDisplay = `[${postTitle.replace(/&amp;/g, "&")}](https://redd.it/${postData.id})`;
						if (viewAll) toDisplay += ` (${postData.subreddit_name_prefixed})`
						entries[0].push(toDisplay);
					}
				} else {
					for (const post of results) {
						let postData = post.data,
							postTitle = postData.title.length > 200 ? `${postData.title.slice(0, 200)}...` : postData.title,
							toDisplay = `[${postTitle.replace(/&amp;/g, "&")}](https://redd.it/${postData.id})`;
						if (viewAll) toDisplay += ` (${postData.subreddit_name_prefixed})`
						let postFlair = postData.link_flair_text;
						if (postFlair) toDisplay += ` [${postData.link_flair_text}]`

						entries[0].push(`${toDisplay}\n - 👍 ${postData.score} | 💬 ${postData.num_comments} | u/${postData.author.replace(/_/g, "\\_")} | ${getDuration(postData.created_utc * 1000, null, true)}`);
					}
				}
				
				let embedTitle = "Reddit - ";
				if (args[0] == "random") {
					embedTitle += "Random subreddit!";
				} else if (viewAll) {
					embedTitle += "All subreddits";
				} else {
					embedTitle += `r/${subreddit}`;
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
						missingArgMsg: "You need to provide a term to look up the Urban Dictionary!",
						infiniteArgs: true,
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
						defs.list.map(def => `Urban Dictionary - ${def.word}`),
						defs.list.map(def => def.definition.length > 2000 ? `${def.definition.slice(0, 2000)}...` : def.definition),
						defs.list.map(def => {
							return [
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
					let pageFlag = flags.find(f => f.name == "page");
					paginator.paginate(message, {
						thumbnail: {url: "https://i.imgur.com/Bg54V46.png"}
					}, entries, {
						limit: 1,
						numbered: false,
						page: pageFlag ? pageFlag.args : 1,
						params: ["title", "description", "fields"]
					});
				} else {
					message.channel.send("No definition found for that term.");
				}
			})
		}
	},
	class WikipediaCommand extends Command {
		constructor() {
			super({
				name: "wikipedia",
				description: "Get the summary of a term from Wikipedia",
				aliases: ["wiki"],
				args: [
					{
						missingArgMsg: "You need to provide a term to look up Wikipedia!",
						infiniteArgs: true,
						type: "string"
					}
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				},
				usage: "wikipedia <term>"
			});
		}
		
		async run(bot, message, args, flags) {
			request.get({
				url: "https://en.wikipedia.org/w/api.php",
				qs: {
					action: "query",
					explaintext: true,
					format: "json",
					prop: "extracts",
					redirects: true,
					titles: args[0].split("|", 1)[0]
				},
				json: true
			}, (err, res) => {
				if (err) return message.channel.send(`Could not request to Wikipedia: ${err.message}`);
				if (!res) return message.channel.send("No response was received from Wikipedia.");
				if (res.statusCode >= 400) return message.channel.send(`The request to Wikipedia failed with status code ${res.statusCode} (${res.statusMessage})`);

				let result = Object.values(res.body.query.pages)[0],
					resultText = result.extract;
				if (!resultText) return message.channel.send("No Wikipedia article exists for that term. *(Make sure to check capitalization)*");
				
				let firstSectionIndex = resultText.indexOf("==");
				if (firstSectionIndex > 2000) {
					resultText = `${resultText.slice(0, 2000)}...`
				} else if (firstSectionIndex > 1000) {
					resultText = resultText.slice(0, firstSectionIndex);
				} else {
					resultText = resultText.slice(0, 1000);
					if (result.extract.length > 1000) resultText += "...";
				}

				message.channel.send(new Discord.RichEmbed()
				.setTitle(`Wikipedia - ${result.title}`)
				.setDescription(resultText)
				.setColor(Math.floor(Math.random() * 16777216))
				.setThumbnail("https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png")
				);
			})
		}
	}
];
