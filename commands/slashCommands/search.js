const {MessageEmbed} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	{checkRemoteRequest, getDateAndDurationString} = require("../../modules/functions.js"),
	Paginator = require("../../utils/paginator.js"),
	request = require("request");

const redirSubreddits = [
	{
		name: "antijokes",
		fn: ctx => {
			ctx.parsedArgs["type"] = "antijokes";
			ctx.bot.slashCommands.get("fun").subcommands.find(sc => sc.name == "joke").run();
		}
	},
	{
		name: "antimeme",
		fn: ctx => {
			ctx.bot.slashCommands.get("reddit").subcommands.find(sc => sc.name == "antimeme").run();
		}
	},
	{
		name: "bonehurtingjuice",
		fn: ctx => {
			ctx.bot.slashCommands.get("reddit").subcommands.find(sc => sc.name == "bonehurtingjuice").run();
		}
	},
	{
		name: "discord_irl",
		fn: ctx => {
			ctx.bot.slashCommands.get("reddit").subcommands.find(sc => sc.name == "discord_irl").run();
		}
	},
	{
		name: "jokes",
		fn: ctx => {
			ctx.parsedArgs["type"] = "jokes";
			ctx.bot.slashCommands.get("fun").subcommands.find(sc => sc.name == "joke").run();
		}
	},
	{
		name: "me_irl",
		fn: ctx => {
			ctx.bot.slashCommands.get("reddit").subcommands.find(sc => sc.name == "me_irl").run();
		}
	},
	{
		name: "memes",
		fn: ctx => {
			ctx.bot.slashCommands.get("reddit").subcommands.find(sc => sc.name == "memes").run();
		}
	},
	{
		name: "puns",
		fn: ctx => {
			ctx.parsedArgs["type"] = "puns";
			ctx.bot.slashCommands.get("fun").subcommands.find(sc => sc.name == "joke").run();
		}
	}
];

const subcommands = [
	class RedditSubcommand extends Command {
		constructor() {
			super({
				name: "reddit",
				description: "Get posts from Reddit",
				args: [
					{
						name: "subreddit",
						description: "Subreddit name",
						type: "string"
					},
					{
						name: "type",
						description: "Type of posts to view",
						type: "string",
						choices: [
							{name: "Top", value: "top"},
							{name: "New", value: "new"},
							{name: "Rising", value: "rising"},
							{name: "Controversial", value: "controversial"}
						]
					},
					{
						name: "time",
						description: "Time period for top/controversial posts",
						type: "string",
						choices: [
							{name: "Past Hour", value: "hour"},
							{name: "Past Day", value: "day"},
							{name: "Past Week", value: "week"},
							{name: "Past Month", value: "month"},
							{name: "Past Year", value: "year"},
							{name: "All-time", value: "all"}
						]
					},
					{
						name: "more",
						description: "See more posts",
						type: "boolean"
					},
					{
						name: "compact",
						description: "Compact post form",
						type: "boolean"
					}
				],
				cooldown: {
					time: 20000,
					type: "channel"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}

		async run(ctx) {
			const rawSubreddit = ctx.parsedArgs["subreddit"],
				compact = ctx.parsedArgs["compact"];
			let subreddit;
			if (rawSubreddit) {
				const foundRedirSub = redirSubreddits.find(e => e.name == rawSubreddit.toLowerCase());
				if (foundRedirSub) return foundRedirSub.fn(ctx);

				await ctx.interaction.deferReply();

				subreddit = rawSubreddit.replace(/^\/?[Rr]\//, "").replace(/ /g, "_");
				if (subreddit.length < 3 || subreddit.length > 21) return ctx.respond("Subreddit names must have in between 3 and 21 characters.", {level: "warning"});
				if (!(/^[0-9A-Za-z_]+$/).test(subreddit)) return ctx.respond("Subreddit names should contain alphanumeric characters and underscores.", {level: "warning"});
			} else {
				subreddit = "all";
			}
			const numToDisplay = compact ? 50 : 25,
				reqQuery = {
					limit: ctx.parsedArgs["more"] ? numToDisplay * 2 : numToDisplay,
					raw_json: 1
				};
			const postSort = ctx.parsedArgs["type"] || "hot";
			let timeSort;

			if (postSort == "top") {
				timeSort = ctx.parsedArgs["time"] || "week";
				reqQuery.t = timeSort;
			} else if (postSort == "controversial") {
				timeSort = ctx.parsedArgs["time"] || "day";
				reqQuery.t = timeSort;
			}

			request.get({
				url: `https://reddit.com/r/${subreddit}/${postSort}.json`,
				qs: reqQuery,
				json: true
			}, (err, res) => {
				if (err) return ctx.respond(`Could not request to Reddit: ${err.message}`, {level: "warning"});
				if (!res) return ctx.respond("No response was received from Reddit.", {level: "warning"});
				if (res.statusCode == 403) return ctx.respond("Unfortunately, that subreddit is inaccessible.", {level: "warning"});
				if (res.statusCode >= 400) return ctx.respond(`The request to Reddit failed with status code ${res.statusCode} (${res.statusMessage})`, {level: "warning"});

				let results = res.body.data.children;
				if (!results[0]) return ctx.respond("A subreddit with that name does not exist, or it has no posts yet.", {level: "warning"});
				if (results[0].kind != "t3") return ctx.respond("A subreddit with that name does not exist, " +
					"but these related subreddits were found:\n" + results.map(r => r.data.display_name).join(", "), {level: "warning"});

				results = results.filter(r => !r.data.stickied && !r.data.locked);
				if (!ctx.interaction.channel.nsfw) results = results.filter(r => !r.data.over_18);
				if (results.length == 0) return ctx.respond("No results found in the subreddit. *(You may try going to an NSFW channel to see all results)*", {level: "warning"});

				const viewAll = subreddit == "all" || subreddit == "popular",
					entries = [[]];

				if (compact) {
					for (const post of results) {
						const postData = post.data,
							postTitle = postData.title.length > 150 ? postData.title.slice(0, 150) + "..." : postData.title;
						let toDisplay = `[${postTitle}](https://redd.it/${postData.id})`;
						if (viewAll) toDisplay += ` (${postData.subreddit_name_prefixed})`;
						entries[0].push(toDisplay);
					}
				} else {
					for (const post of results) {
						const postData = post.data,
							postTitle = postData.title.length > 200 ? postData.title.slice(0, 200) + "..." : postData.title;
						let toDisplay = `[${postTitle}](https://redd.it/${postData.id})`;
						if (viewAll) toDisplay += ` (${postData.subreddit_name_prefixed})`;
						const postFlair = postData.link_flair_text;
						if (postFlair) toDisplay += ` [${postData.link_flair_text}]`;

						entries[0].push(toDisplay + `\n - 👍 ${postData.score} | 💬 ${postData.num_comments} | ` +
							`u/${postData.author.replace(/_/g, "\\_")} | ${getDateAndDurationString(postData.created_utc * 1000, false)}`);
					}
				}

				let embedTitle = "Reddit - ";
				if (rawSubreddit == "random") {
					embedTitle += "Random subreddit!";
				} else if (!rawSubreddit || rawSubreddit == "all") {
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

				new Paginator(ctx, entries, {
					title: embedTitle,
					thumbnail: {
						url: "https://www.redditstatic.com/new-icon.png"
					}
				}, {
					limit: compact ? 10 : 5,
					noStop: viewAll,
					numbered: true,
					reactTimeLimit: 60000
				}).start();
			});
		}
	},
	class UrbanSubcommand extends Command {
		constructor() {
			super({
				name: "urban",
				description: "Define a term on Urban Dictionary",
				args: [
					{
						name: "query",
						description: "Search terms",
						type: "string",
						required: true
					},
					{
						name: "exact",
						description: "Show definitions matching all terms",
						type: "boolean"
					}
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}

		async run(ctx) {
			await ctx.interaction.deferReply();

			const query = ctx.parsedArgs["query"];
			request.get({
				url: "http://api.urbandictionary.com/v0/define",
				qs: {term: query},
				json: true
			}, (err, res) => {
				const requestRes = checkRemoteRequest("the Urban Dictionary", err, res);
				if (requestRes != true) return ctx.respond(requestRes, {level: "warning"});

				let defList = res.body.list;
				if (ctx.parsedArgs["exact"]) {
					const userWords = query.toLowerCase().split(" ");
					defList = defList.filter(def => {
						const words = def.word.toLowerCase().split(" ");
						if (userWords.length != words.length) return false;
						for (let i = 0; i < words.length; i++) {
							const word = words[i],
								wordBase = word.endsWith("s") ? word.slice(word.length - 1) : word;
							if (!userWords[i].includes(wordBase)) return false;
						}
						return true;
					});
				}
				if (defList.length == 0) return ctx.respond("No definition found for that term.", {level: "warning"});

				const entries = [
					defList.map(def => "Urban Dictionary - " + def.word),
					defList.map(def => def.definition.length > 2000 ? def.definition.slice(0, 2000) + "..." : def.definition),
					defList.map(def => {
						return [
							{
								name: "Example",
								value: def.example.length > 0 ? (def.example.length > 1000 ? def.example.slice(0, 1000) + "..." : def.example) : "No example given"
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

				new Paginator(ctx, entries, {
					thumbnail: {url: "https://i.imgur.com/Bg54V46.png"}
				}, {params: ["title", "description", "fields"]}).start();
			});
		}
	},
	class WikipediaSubcommand extends Command {
		constructor() {
			super({
				name: "wikipedia",
				description: "Search a term on Wikipedia",
				args: [
					{
						name: "query",
						description: "Search terms",
						type: "string",
						required: true
					}
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}

		async run(ctx) {
			await ctx.interaction.deferReply();

			request.get({
				url: "https://en.wikipedia.org/w/api.php",
				qs: {
					action: "query",
					explaintext: true,
					format: "json",
					prop: "extracts",
					redirects: true,
					titles: ctx.parsedArgs["query"].split("|", 1)[0]
				},
				json: true
			}, (err, res) => {
				const requestRes = checkRemoteRequest("Wikipedia", err, res);
				if (requestRes != true) return ctx.respond(requestRes, {level: "warning"});

				const result = Object.values(res.body.query.pages)[0];
				let resultText = result.extract;
				if (!resultText) return ctx.respond("No Wikipedia article exists for that term. *(Make sure to check capitalization)*", {level: "warning"});

				const firstSectionIndex = resultText.indexOf("==");
				if (firstSectionIndex > 2000) {
					resultText = resultText.slice(0, 2000) + "...";
				} else if (firstSectionIndex > 750) {
					resultText = resultText.slice(0, firstSectionIndex);
				} else {
					resultText = resultText.slice(0, firstSectionIndex + 500) + "...";
				}

				ctx.respond(new MessageEmbed()
					.setTitle(`Wikipedia - ${result.title}`)
					.setDescription(resultText)
					.setColor(Math.floor(Math.random() * 16777216))
					.setThumbnail("https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png")
					.addField("Article URL", "https://en.wikipedia.org/wiki/" + result.title.replace(/ /g, "_"))
				);
			});
		}
	},
	class XKCDSubcommand extends Command {
		constructor() {
			super({
				name: "xkcd",
				description: "Get an XKCD comic",
				args: [
					{
						name: "number",
						description: "Comic num. to view",
						type: "integer",
						min: 1
					},
					{
						name: "random",
						description: "View a random comic",
						type: "boolean"
					}
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
			this.lastChecked = 0;
			this.currComicNum = 0;
		}

		async run(ctx) {
			await ctx.interaction.deferReply();

			const comicNum = ctx.parsedArgs["number"],
				random = ctx.parsedArgs["random"];
			let comicToPost;
			if (Date.now() > this.lastChecked + 1000*86400) {
				try {
					const latestComic = await this.getComic();
					this.currComicNum = latestComic.num;
					if (!comicNum && !random) comicToPost = latestComic;
				} catch (err) {
					return ctx.respond(err, {level: "warning"});
				}
			}

			try {
				if (random) {
					const rand = Math.ceil(Math.random() * this.currComicNum);
					await this.postComic(ctx, `https://xkcd.com/${rand}/info.0.json`, {titlePrefix: "Random "});
				} else if (comicNum) {
					if (comicNum > this.currComicNum) return ctx.respond("Invalid comic number provided.", {level: "warning"});
					await this.postComic(ctx, `https://xkcd.com/${comicNum}/info.0.json`);
				} else {
					await this.postComic(ctx, null, {comic: comicToPost, titlePrefix: "Current "});
				}
			} catch (err) {
				return ctx.respond(checkRemoteRequest("XKCD", err.err, err.res), {level: "warning"});
			}
		}

		getComic(url) {
			return new Promise((resolve, reject) => {
				request.get(url || "https://xkcd.com/info.0.json", (err, res) => {
					if (err || !res || res.statusCode >= 400) reject({err: err, res: res});
					resolve(JSON.parse(res.body));
				});
			});
		}

		async postComic(ctx, url, options = {}) {
			const comic = options.comic || await this.getComic(url);
			ctx.respond(new MessageEmbed()
				.setTitle(`${options.titlePrefix || ""}XKCD Comic - ${comic.title} (#${comic.num})`)
				.setDescription(comic.alt)
				.setColor(Math.floor(Math.random() * 16777216))
				.setImage(comic.img)
			);
		}
	}
];

class SearchCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "search",
			description: "Online searches",
			subcommands: subcommands
		});
	}
}

module.exports = SearchCommandGroup;
