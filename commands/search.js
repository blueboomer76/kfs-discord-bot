const {RichEmbed} = require("discord.js"),
	Command = require("../structures/command.js"),
	{getDuration} = require("../modules/functions.js"),
	paginator = require("../utils/paginator.js"),
	request = require("request");

const redirSubreddits = [
	{name: "antijokes", goTo: "antijoke"},
	{name: "antimeme", goTo: "antimeme"},
	{name: "jokes", goTo: "joke"},
	{name: "me_irl", goTo: "meirl"},
	{name: "memes", goTo: "meme"},
	{name: "puns", goTo: "pun"}
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
					time: 20000,
					type: "channel"
				},
				examples: [
					"reddit funny",
					"reddit aww --new",
					"reddit gaming --more",
					"reddit todayilearned --top week"
				],
				flags: [
					{
						name: "controversial",
						desc: "See controversial posts within an optional time period",
						arg: {
							type: "oneof",
							optional: true,
							allowedValues: ["hour", "day", "week", "month", "year", "all"]
						}
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
						desc: "See top posts within an optional time period",
						arg: {
							type: "oneof",
							optional: true,
							allowedValues: ["hour", "day", "week", "month", "year", "all"]
						}
					}
				],
				perms: {
					bot: ["ADD_REACTIONS", "EMBED_LINKS", "MANAGE_MESSAGES"],
					user: [],
					level: 0
				},
				usage: "reddit [subreddit] [--((controversial|top) [hour|day|week|month|year|all] | (new|rising))] [--more] [--squeeze]"
			});
		}
		
		async run(bot, message, args, flags) {
			const compact = flags.some(f => f.name == "squeeze");
			let subreddit;
			if (args[0]) {
				const foundRedirSub = redirSubreddits.find(e => e.name == args[0].toLowerCase());
				if (foundRedirSub) return bot.commands.get(foundRedirSub.goTo).run(bot, message);
				subreddit = args[0].replace(/^\/?[Rr]\//, "");
				if (subreddit.length < 3 || subreddit.length > 21) return {cmdWarn: "Subreddit names should have in between 3 and 21 characters."};
				if (!(/^[0-9A-Za-z_]+$/).test(subreddit)) return {cmdWarn: "Subreddit names should be alphanumeric with underscores only."};
			} else {
				subreddit = "all";
			}
			const numToDisplay = compact ? 50 : 25,
				reqQuery = {
					limit: flags.some(f => f.name == "more") ? numToDisplay * 2 : numToDisplay,
					raw_json: 1
				};
			let postSort = "hot", timeSort;
			
			const topFlag = flags.find(f => f.name == "top"),
				controversialFlag = flags.find(f => f.name == "controversial");
			if (topFlag) {
				postSort = "top";
				timeSort = topFlag.args || "week";
				reqQuery.t = timeSort;
			} else if (flags.some(f => f.name == "new")) {
				postSort = "new";
			} else if (flags.some(f => f.name == "rising")) {
				postSort = "rising";
			} else if (controversialFlag) {
				postSort = "controversial";
				timeSort = controversialFlag.args || "day";
				reqQuery.t = timeSort;
			}
			
			request.get({
				url: `https://reddit.com/r/${subreddit}/${postSort}.json`,
				qs: reqQuery,
				json: true
			}, (err, res) => {
				if (err) return message.channel.send(`⚠ Could not request to Reddit: ${err.message}`);
				if (!res) return message.channel.send("⚠ No response was received from Reddit.");
				if (res.statusCode == 403) return message.channel.send("⚠ Unfortunately, that subreddit is inaccessible.");
				if (res.statusCode >= 400) return message.channel.send(`⚠ The request to Reddit failed with status code ${res.statusCode} (${res.statusMessage})`);
				
				let results = res.body.data.children;
				if (!results[0]) return message.channel.send("⚠ A subreddit with that name does not exist, or it has no posts yet.");
				if (results[0].kind != "t3") return message.channel.send("⚠ A subreddit with that name does not exist, but these related subreddits were found: " + "\n" + results.map(r => {
					return r.data.display_name;
				}).join(", "));

				results = results.filter(r => !r.data.stickied);
				if (!message.channel.nsfw) results = results.filter(r => !r.data.over_18);
				if (results.length == 0) return message.channel.send("⚠ No results found in the subreddit. *(You may try going to an NSFW channel to see all results)*");
				
				const viewAll = !args[0] || args[0] == "all" || args[0] == "popular",
					entries = [[]];

				if (compact) {
					for (const post of results) {
						const postData = post.data,
							postTitle = postData.title.length > 150 ? `${postData.title.slice(0, 150)}...` : postData.title;
						let toDisplay = `[${postTitle}](https://redd.it/${postData.id})`;
						if (viewAll) toDisplay += ` (${postData.subreddit_name_prefixed})`;
						entries[0].push(toDisplay);
					}
				} else {
					for (const post of results) {
						const postData = post.data,
							postTitle = postData.title.length > 200 ? `${postData.title.slice(0, 200)}...` : postData.title;
						let toDisplay = `[${postTitle}](https://redd.it/${postData.id})`;
						if (viewAll) toDisplay += ` (${postData.subreddit_name_prefixed})`;
						const postFlair = postData.link_flair_text;
						if (postFlair) toDisplay += ` [${postData.link_flair_text}]`;

						entries[0].push(`${toDisplay}\n - 👍 ${postData.score} | 💬 ${postData.num_comments} | u/${postData.author.replace(/_/g, "\\_")} | ${getDuration(postData.created_utc * 1000, null, true)}`);
					}
				}
				
				let embedTitle = "Reddit - ";
				if (args[0] == "random") {
					embedTitle += "Random subreddit!";
				} else if (!args[0] || args[0] == "all") {
					embedTitle += "All subreddits";
				} else {
					embedTitle += "r/" + subreddit;
				}
				
				if (postSort != "hot") {
					if (postSort == "top" || postSort == "controversial") {
						timeSort = timeSort == "all" ? "all-time" : "past " + timeSort;
						embedTitle += ` (${postSort} posts, ${timeSort})`;
					} else {
						embedTitle += ` (${postSort} posts)`;
					}
				}
				
				paginator.paginate(message, {
					title: embedTitle,
					thumbnail: {
						url: "https://www.redditstatic.com/new-icon.png"
					}
				}, entries, {
					limit: compact ? 10 : 5,
					noStop: viewAll,
					numbered: true,
					page: 1,
					params: null
				});
			});
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
				json: true
			}, (err, res) => {
				const requestRes = bot.checkRemoteRequest("the Urban Dictionary", err, res);
				if (requestRes != true) return message.channel.send(requestRes);

				const defs = res.body;
				if (defs.list.length > 0) {
					const entries = [
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
							];
						})
					];
					const pageFlag = flags.find(f => f.name == "page");
					paginator.paginate(message, {
						thumbnail: {url: "https://i.imgur.com/Bg54V46.png"}
					}, entries, {
						limit: 1,
						numbered: false,
						page: pageFlag ? pageFlag.args : 1,
						params: ["title", "description", "fields"]
					});
				} else {
					message.channel.send("⚠ No definition found for that term.");
				}
			});
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
				const requestRes = bot.checkRemoteRequest("Wikipedia", err, res);
				if (requestRes != true) return message.channel.send(requestRes);

				const result = Object.values(res.body.query.pages)[0];
				let resultText = result.extract;
				if (!resultText) return message.channel.send("⚠ No Wikipedia article exists for that term. *(Make sure to check capitalization)*");
				
				const firstSectionIndex = resultText.indexOf("==");
				if (firstSectionIndex > 2000) {
					resultText = resultText.slice(0, 2000) + "...";
				} else if (firstSectionIndex > 750) {
					resultText = resultText.slice(0, firstSectionIndex);
				} else {
					resultText = resultText.slice(0, firstSectionIndex + 500) + "...";
				}

				message.channel.send(new RichEmbed()
					.setTitle(`Wikipedia - ${result.title}`)
					.setDescription(resultText)
					.setColor(Math.floor(Math.random() * 16777216))
					.setThumbnail("https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png")
					.addField("Article URL", `https://en.wikipedia.org/wiki/${result.title.replace(/ /g, "_")}`)
				);
			});
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
						testFunction: obj => {return obj.toLowerCase() == "random" || parseInt(obj) >= 1}
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
			if (args[0]) args[0] = args[0].toLowerCase();
			request.get("https://xkcd.com/info.0.json", (err, res) => {
				const requestRes = bot.checkRemoteRequest("XKCD", err, res);
				if (requestRes != true) return message.channel.send(requestRes);
				
				const currComic = JSON.parse(res.body);
				if (args[0] == "random" || parseInt(args[0]) > 0) {
					let comicNum;
					if (args[0] == "random") {
						comicNum = Math.ceil(Math.random() * currComic.num);
					} else {
						const chosenComicNum = parseInt(args[0]);
						if (chosenComicNum > currComic.num) return message.channel.send("Invalid comic number provided.");
						comicNum = chosenComicNum;
					}
					request.get(`https://xkcd.com/${comicNum}/info.0.json`, (err2, res2) => {
						if (err2 || !res2 || res2.statusCode >= 400) {
							this.postComic(message, currComic, "Current ", true);
							return;
						}
						const chosenComic = JSON.parse(res2.body);
						this.postComic(message, chosenComic, args[0] == "random" ? "Random " : "");
					});
				} else {
					this.postComic(message, currComic, "Current ");
				}
			});
		}
		
		postComic(message, comic, titlePrefix, isFallback) {
			const xkcdEmbed = new RichEmbed()
				.setTitle(`${titlePrefix}XKCD Comic - ${comic.title} (#${comic.num})`)
				.setDescription(comic.alt)
				.setColor(Math.floor(Math.random() * 16777216))
				.setImage(comic.img);
			
			if (isFallback) xkcdEmbed.description = `*Failed to fetch from XKCD, defaulting to the current one.*\n\n${comic.alt}`;
			message.channel.send(xkcdEmbed);
		}
	}
];
