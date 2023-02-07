const {MessageEmbed} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	request = require("request");

const subredditData = [
	{
		name: "antimeme",
		fetchOptions: {filterScores: true}
	},
	{
		name: "bonehurtingjuice",
		fetchOptions: {filterScores: true}
	},
	{
		name: "discord_irl",
		hasNsfw: true,
		fetchOptions: {filterScores: true}
	},
	{
		name: "me_irl"
	},
	{
		name: "memes"
	}
];

class RedditCommand extends Command {
	constructor() {
		super({
			name: "reddit",
			description: "Reddit-based commands",
			args: [
				{
					name: "subreddit",
					description: "Subreddit to get images from",
					type: "string",
					required: true,
					choices: subredditData.map(data => {
						return {name: data.name, value: data.name};
					})
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
			}
		});

		this.subredditData = {};

		for (const data of subredditData) {
			this.subredditData[data.name] = {
				subreddit: data.name,
				hasNsfw: data.hasNsfw,
				fetchOptions: data.fetchOptions || {},
				cachedSfwPosts: [],
				lastChecked: 0
			};
			if (data.hasNsfw) this.subredditData[data.name].cachedNsfwPosts = [];
		}
	}

	async run(ctx) {
		const subreddit = ctx.parsedArgs["subreddit"];
		const subredditData = this.subredditData[subreddit];

		if (Date.now() > subredditData.lastChecked + 1000*7200 || subredditData.cachedSfwPosts.length == 0) {
			await ctx.interaction.deferReply();

			const fetchRes = await this.updatePosts(subreddit);
			if (fetchRes) return ctx.respond(fetchRes, {level: "warning"});
		}

		this.sendRedditEmbed(ctx, subreddit);
	}

	async updatePosts(subreddit) {
		const subredditData = this.subredditData[subreddit];

		let fetchRes;
		await this.getPosts(subreddit)
			.then(posts => {
				subredditData.lastChecked = Date.now();
				subredditData.cachedSfwPosts = posts.sfw;
				if (subredditData.hasNsfw) subredditData.cachedNsfwPosts = posts.nsfw;
			})
			.catch(err => fetchRes = err);
		return fetchRes;
	}

	getPosts(subreddit) {
		const subredditData = this.subredditData[subreddit];

		return new Promise((resolve, reject) => {
			request.get({
				url: `https://reddit.com/r/${subreddit}/hot.json`,
				qs: {raw_json: 1},
				json: true
			}, (err, res) => {
				if (err) return reject(`Could not request to Reddit: ${err.message} (${err.code})`);
				if (!res) return reject("No response was received from Reddit.");
				if (res.statusCode >= 400) return reject(`An error has been returned from Reddit: ${res.statusMessage} (${res.statusCode}). Try again later.`);

				let results = res.body.data.children.filter(r => !r.data.stickied);
				if (subredditData.filterLocked) results = results.filter(r => !r.data.locked);
				if (subredditData.filterScores) results = results.filter(r => r.data.score > 0);
				if (subredditData.hasNsfw) {
					const sfwResults = [], nsfwResults = [];

					for (const result of results) {
						const postData = {
							title: result.data.title,
							url: result.data.permalink,
							score: result.data.score,
							comments: result.data.num_comments,
							author: result.data.author,
							imageURL: /v\.redd\.it/.test(result.data.url) && result.data.preview ? result.data.preview.images[0].source.url : result.data.url
						};
						if (result.data.over_18) {nsfwResults.push(postData)} else {sfwResults.push(postData)}
					}

					resolve({sfw: sfwResults, nsfw: nsfwResults});
				} else {
					resolve({
						sfw: results.map(r => {
							return {
								title: r.data.title,
								url: r.data.permalink,
								score: r.data.score,
								comments: r.data.num_comments,
								author: r.data.author,
								imageURL: /v\.redd\.it/.test(r.data.url) && r.data.preview ? r.data.preview.images[0].source.url : r.data.url
							};
						})
					});
				}
			});
		});
	}

	sendRedditEmbed(ctx, subreddit) {
		const subredditData = this.subredditData[subreddit];

		let postData;
		if (subredditData.hasNsfw) {
			if (!ctx.interaction.channel.nsfw) {
				postData = subredditData.cachedSfwPosts.splice(Math.floor(Math.random() * subredditData.cachedSfwPosts.length), 1);
			} else {
				const postPos = Math.floor(Math.random() * (subredditData.cachedSfwPosts.length + subredditData.cachedNsfwPosts.length));
				if (postPos < subredditData.cachedSfwPosts.length) {
					postData = subredditData.cachedSfwPosts.splice(postPos, 1);
				} else {
					postData = subredditData.cachedNsfwPosts.splice(postPos - subredditData.cachedSfwPosts.length, 1);
				}
			}
		} else {
			postData = subredditData.cachedSfwPosts.splice(Math.floor(Math.random() * subredditData.cachedSfwPosts.length), 1);
		}
		postData = postData[0];

		const embedTitle = postData.title, imageURL = postData.imageURL;
		if (imageURL.startsWith("https://external-") || /\.(gif|jpe?g|png)$/.test(imageURL)) {
			ctx.respond(new MessageEmbed()
				.setTitle(embedTitle.length > 250 ? embedTitle.slice(0, 250) + "..." : embedTitle)
				.setURL("https://reddit.com" + postData.url)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter({text: `👍 ${postData.score} | 💬 ${postData.comments} | 👤 ${postData.author}`})
				.setImage(imageURL)
			);
		} else {
			ctx.respond(imageURL + ` (👍 ${postData.score} | 💬 ${postData.comments} | 👤 ${postData.author} | ` +
				"ID: " + postData.url.match(/comments\/([0-9a-z]+)(?=\/)/)[1] + ")");
		}
	}
}

class RedditCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "reddit",
			description: "Reddit-based commands",
			command: RedditCommand
		});
	}
}

module.exports = RedditCommandGroup;
