const {RichEmbed} = require("discord.js"),
	Command = require("../structures/command.js"),
	paginator = require("../utils/paginator.js"),
	{capitalize, getDuration} = require("../modules/functions.js"),
	request = require("request");

const redirSubreddits = [
	{name: "anime_irl", goTo: "animeirl"},
	{name: "animemes", goTo: "animeme"},
	{name: "memes", goTo: "meme"}
];

module.exports = [
	class RedditCommand extends Command {
		constructor() {
			super({
				name: "reddit",
				description: "Get Reddit posts, from all subreddits or a single one",
				args: [
					{
						infiniteArgs: true,
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
					"reddit aww --new",
					"reddit gaming --more"
				],
				flags: [
					{
						name: "controversial",
						desc: "Whether to see controversial posts"
					},
					{
						name: "more",
						desc: "Whether to see more posts at a time"
					},
					{
						name: "new",
						desc: "Whether to see new posts"
					},
					{
						name: "rising",
						desc: "Whether to see rising posts"
					},
					{
						name: "squeeze",
						desc: "Whether to squeeze the displayed posts"
					},
					{
						name: "top",
						desc: "Whether to show top posts"
					}
				],
				perms: {
					bot: ["EMBED_LINKS", "MANAGE_MESSAGES"],
					user: [],
					level: 0
				},
				usage: "reddit [subreddit] [--(controversial|new|rising|top)] [--more] [--squeeze]"
			});
		}
		
		async run(bot, message, args, flags) {
			let subreddit, compact = flags.some(f => f.name == "squeeze");
			if (args[0]) {
				const foundRedirSub = redirSubreddits.find(e => e.name == args[0].toLowerCase());
				if (foundRedirSub) return bot.commands.get(foundRedirSub.goTo).run(bot, message);
				subreddit = args[0].replace(/^\/?(R|r)\//, "")
				if (subreddit.length < 3) return {cmdWarn: "Subreddit names should have at least 3 characters."};
				if (!(/^[0-9A-Za-z_]+$/).test(subreddit)) return {cmdWarn: "Subreddit names should be alphanumeric with underscores only."}
			} else {
				subreddit = "all"
			};
			const numToDisplay = compact ? 50 : 25;
			let postSort = "hot", reqQuery = {
				limit: flags.some(f => f.name == "more") ? numToDisplay * 2 : numToDisplay,
				raw_json: 1
			};
				
			if (flags.some(f => f.name == "top")) {
				postSort = "top";
				reqQuery.t = "week";
			} else if (flags.some(f => f.name == "new")) {
				postSort = "new";
			} else if (flags.some(f => f.name == "rising")) {
				postSort = "rising";
			} else if (flags.some(f => f.name == "controversial")) {
				postSort = "controversial";
			}
			
			request.get({
				url: `https://reddit.com/r/${subreddit}/${postSort}.json`,
				qs: reqQuery,
				json: true
			}, (err, res) => {
				if (res.statusCode == 403) return message.channel.send("⚠ Unfortunately, that subreddit is inaccessible.")
				if (err || res.statusCode >= 400) return message.channel.send(`⚠ Failed to fetch from Reddit. (status code ${res.statusCode})`)
				
				let results = res.body.data.children;
				if (!results[0] || results[0].kind != "t3") return message.channel.send("⚠ A subreddit with that name does not exist.")
				
				results = results.filter(r => !r.data.stickied);
				if (!message.channel.nsfw) results = results.filter(r => !r.data.over_18);
				if (results.length == 0) return message.channel.send("⚠ No results found in the subreddit. *(You may try going to an NSFW channel to see all results)*")
				
				let entries = [[]], viewAll = false;
				if (!args[0] || args[0] == "all" || args[0] == "popular") viewAll = true;
								
				if (compact) {
					for (const post of results) {
						let postData = post.data,
							postTitle = postData.title.length < 150 ? postData.title : `${postData.title.slice(0,150)}...`,
							toDisplay = `[${postTitle}](https://redd.it/${postData.id})`;
						if (viewAll) toDisplay += ` (${postData.subreddit_name_prefixed})`
						entries[0].push(toDisplay);
					}
				} else {
					for (const post of results) {
						let postData = post.data,
							postTitle = postData.title.length < 200 ? postData.title : `${postData.title.slice(0,200)}...`,
							toDisplay = `[${postTitle}](https://redd.it/${postData.id})`;
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
					embedTitle += `r/${subreddit}`;
				}
				
				if (postSort != "hot") embedTitle += ` (${capitalize(postSort)} Posts)` 
				
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
				qs: {term: args[0]},
				json: true
			}, (err, res) => {
				if (err || res.statusCode >= 400) return message.channel.send(`⚠ Failed to fetch from the Urban Dictionary. (status code ${res.statusCode})`)
				let defs = res.body;
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
					message.channel.send("⚠ No definition found for that term.")
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
				if (err || res.statusCode >= 400) return message.channel.send(`⚠ Failed to fetch from Wikipedia. (status code ${res.statusCode})`)
				
				let result = Object.values(res.body.query.pages)[0],
					resultText = result.extract;
				if (!resultText) return message.channel.send("⚠ Failed to find a Wikipedia article for that term.")
				
				let firstSectionIndex = resultText.indexOf("==");
				if (firstSectionIndex > 2000) {
					resultText = `resultText.slice(0, 2000)...`
				} else if (firstSectionIndex > 1000) {
					resultText = resultText.slice(0, firstSectionIndex);
				} else {
					resultText = resultText.slice(0, 1000);
					if (resultText.length > 1000) resultText += "...";
				}
				
				message.channel.send(new RichEmbed()
				.setTitle(`Wikipedia - ${result.title}`)
				.setThumbnail("https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png")
				.setColor(Math.floor(Math.random() * 16777216))
				.setDescription(resultText)
				)
			})
		}
	},
	class XKCDCommand extends Command {
		constructor() {
			super({
				name: "xkcd",
				description: "Get a comic from XKCD",
				args: [
					{
						errorMsg: "Please provide \"random\", a number greater than 0, or supply no arguments.",
						optional: true,
						type: "function",
						testFunction: obj => {return obj == "random" || obj > 0}
					}
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				},
				usage: "xkcd [<number> | random]"
			});
		}
		
		async run(bot, message, args, flags) {
			request.get("https://xkcd.com/info.0.json", (err, res) => {
				if (err || res.statusCode >= 400) return message.channel.send(`Failed to fetch from XKCD. (status code ${res.statusCode})`)
				
				let currComic = JSON.parse(res.body);
				
				if (args[0] == "random" || args[0] > 0) {
					let comicNum = args[0] == "random" ? Math.floor(Math.random() * currComic.num) : parseInt(args[0]);
					request.get(`https://xkcd.com/${comicNum}/info.0.json`, (err2, res2) => {
						if (err2 || res2.statusCode >= 400) {
							this.postComic(message, currComic, "Current ", res2.statusCode)
							return;
						}
						let chosenComic = JSON.parse(res2.body);
						this.postComic(message, chosenComic, args[0] == "random" ? "Random " : "")
					})
				} else {
					this.postComic(message, currComic, "Current ")
				}
			})
		}
		
		postComic(message, comic, titlePrefix, fallbackCode) {
			let xkcdEmbed = new RichEmbed()
			.setTitle(`${titlePrefix}XKCD Comic - ${comic.title} (#${comic.num})`)
			.setColor(Math.floor(Math.random() * 16777216))
			.setDescription(comic.alt)
			.setImage(comic.img)
			
			if (fallbackCode) xkcdEmbed.description = `*Failed to fetch from XKCD, defaulting to the current one. (status code ${fallbackCode})*\n\n${comic.alt}`
			message.channel.send(xkcdEmbed);
		}
	}
];