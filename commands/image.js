const {RichEmbed} = require("discord.js"),
	Command = require("../structures/command.js"),
	request = require("request");

async function setCommandPosts(command, subreddit, checkNsfw) {
	let fetchRes;
	command.lastChecked = Date.now();
	await getPosts(subreddit, checkNsfw)
		.then(posts => {
			if (checkNsfw) {
				command.lastChecked = Date.now();
				command.cachedSfwPosts = posts.sfw;
				command.cachedNsfwPosts = posts.nsfw;
			} else {
				command.cachedPosts = posts;
			}
		})
		.catch(err => fetchRes = err);
	return fetchRes;
}

function getPosts(subreddit, checkNsfw) {
	return new Promise((resolve, reject) => {
		request.get({
			url: `https://reddit.com/r/${subreddit}/hot.json`,
			qs: {raw_json: 1},
			json: true
		}, (err, res) => {
			if (err) reject(`Could not request to Reddit: ${err.message} (${err.code})`);
			if (res.statusCode >= 400) reject(`An error has been returned from Reddit: ${res.statusMessage} (${res.statusCode})`);
			const results = res.body.data.children.filter(r => !r.data.stickied);
		
			if (checkNsfw) {
				const sfwResults = [], nsfwResults = [];
				
				for (const result of results) {
					const postObj = {
						title: result.data.title,
						url: result.data.permalink,
						score: result.data.score,
						comments: result.data.num_comments,
						author: result.data.author,
						imageURL: /v\.redd\.it/.test(result.data.url) && result.data.preview ? result.data.preview.images[0].source.url : result.data.url
					};
					if (result.data.over_18) {
						nsfwResults.push(postObj);
					} else {
						sfwResults.push(postObj);
					}
				}
				
				resolve({sfw: sfwResults, nsfw: nsfwResults});
			} else {
				resolve(results.map(r => {
					return {
						title: r.data.title,
						url: r.data.permalink,
						score: r.data.score,
						comments: r.data.num_comments,
						author: r.data.author,
						imageURL: r.data.url
					};
				}));
			}
		});
	});
}

function sendRedditEmbed(command, message, checkNsfw) {
	let postData;
	if (checkNsfw) {
		if (!message.channel.nsfw) {
			postData = command.cachedSfwPosts.splice(Math.floor(Math.random() * command.cachedSfwPosts.length), 1);
		} else {
			const postPos = Math.floor(Math.random() * (command.cachedSfwPosts.length + command.cachedNsfwPosts.length));
			if (postPos < command.cachedSfwPosts.length) {
				postData = command.cachedSfwPosts.splice(postPos, 1);
			} else {
				postData = command.cachedNsfwPosts.splice(postPos - command.cachedSfwPosts.length, 1);
			}
		}
	} else {
		postData = command.cachedPosts.splice(Math.floor(Math.random() * command.cachedPosts.length), 1);
	}
	postData = postData[0];

	const embedTitle = postData.title, imageURL = postData.imageURL;
	if (/^https?:\/\/(imgur\.com|v\.redd\.it)/.test(imageURL) || /\.gifv$/.test(imageURL)) {
		message.channel.send(`${imageURL} (👍 ${postData.score} | 💬 ${postData.comments} | By: ${postData.author})`);
	} else {
		const redditEmbed = new RichEmbed()
			.setTitle(embedTitle.length > 250 ? embedTitle.slice(0,250) + "..." : embedTitle)
			.setURL("https://reddit.com" + postData.url)
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter(`👍 ${postData.score} | 💬 ${postData.comments} | By: ${postData.author}`);

		if (/^https:\/\/external-/.test(imageURL) || /\.(gif|jpe?g|png)$/.test(imageURL)) {
			redditEmbed.setImage(imageURL);
		} else {
			redditEmbed.setDescription(imageURL);
		}

		message.channel.send(redditEmbed);
	}
}

module.exports = [
	class AnimemeCommand extends Command {
		constructor() {
			super({
				name: "animeme",
				description: "Gets an \"animeme\", or simply the combination of anime and memes",
				aliases: ["animememe", "memeanime"],
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
			this.cachedSfwPosts = [];
			this.cachedNsfwPosts = [];
			this.lastChecked = 0;
		}
		
		async run(bot, message, args, flags) {
			if (new Date() > this.lastChecked + 1000*7200 || this.cachedSfwPosts.length == 0) {
				const fetchRes = await setCommandPosts(this, "Animemes", true);
				if (fetchRes) return {cmdWarn: fetchRes};
			}
			sendRedditEmbed(this, message, true);
		}
	},
	class AnimeIRLCommand extends Command {
		constructor() {
			super({
				name: "animeirl",
				description: "Anime but in real life",
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
			this.cachedSfwPosts = [];
			this.cachedNsfwPosts = [];
			this.lastChecked = 0;
		}
		
		async run(bot, message, args, flags) {
			if (new Date() > this.lastChecked + 1000*7200 || this.cachedSfwPosts.length == 0) {
				const fetchRes = await setCommandPosts(this, "anime_irl", true);
				if (fetchRes) return {cmdWarn: fetchRes};
			}
			sendRedditEmbed(this, message, true);
		}
	},
	class AntiMemeCommand extends Command {
		constructor() {
			super({
				name: "antimeme",
				description: "Not actually memes",
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
			this.cachedPosts = [];
			this.lastChecked = 0;
		}
		
		async run(bot, message, args, flags) {
			if (new Date() > this.lastChecked + 1000*7200 || this.cachedPosts.length == 0) {
				const fetchRes = await setCommandPosts(this, "antimeme", false);
				if (fetchRes) return {cmdWarn: fetchRes};
			}
			sendRedditEmbed(this, message, false);
		}
	},
	class AwwnimeCommand extends Command {
		constructor() {
			super({
				name: "awwnime",
				description: "Cute anime",
				aliases: ["awwanime", "cuteanime"],
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
			this.cachedSfwPosts = [];
			this.cachedNsfwPosts = [];
			this.lastChecked = 0;
		}
		
		async run(bot, message, args, flags) {
			if (new Date() > this.lastChecked + 1000*7200 || this.cachedSfwPosts.length == 0) {
				const fetchRes = await setCommandPosts(this, "awwnime", true);
				if (fetchRes) return {cmdWarn: fetchRes};
			}
			sendRedditEmbed(this, message, true);
		}
	},
	class BirbCommand extends Command {
		constructor() {
			super({
				name: "birb",
				description: "Get a random birb!",
				aliases: ["bird"],
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
		}
		
		async run(bot, message, args, flags) {
			request.get("http://random.birb.pw/tweet.json", (err, res) => {
				if (err || (res && res.statusCode >= 400)) return bot.handleRemoteSiteError(message, "random.birb.pw", err, res);
				
				message.channel.send(new RichEmbed()
					.setTitle("Here's your random birb!")
					.setColor(Math.floor(Math.random() * 16777216))
					.setFooter("From random.birb.pw")
					.setImage(`https://random.birb.pw/img/${JSON.parse(res.body).file}`)
				);
			});
		}
	},
	class CatCommand extends Command {
		constructor() {
			super({
				name: "cat",
				description: "Get a random cat!",
				aliases: ["kitten", "meow"],
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
		}
		
		async run(bot, message, args, flags) {
			request.get("http://aws.random.cat/meow", (err, res) => {
				if (err || (res && res.statusCode >= 400)) return bot.handleRemoteSiteError(message, "random.cat", err, res);
				message.channel.send(new RichEmbed()
					.setTitle("Here's your random cat!")
					.setColor(Math.floor(Math.random() * 16777216))
					.setFooter("From random.cat")
					.setImage(JSON.parse(res.body).file)
				);
			});
		}
	},
	class DogCommand extends Command {
		constructor() {
			super({
				name: "dog",
				description: "Get a random dog!",
				aliases: ["puppy", "woof"],
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
		}
		
		async run(bot, message, args, flags) {
			request.get("http://random.dog/woof.json", (err, res) => {
				if (err || (res && res.statusCode >= 400)) return bot.handleRemoteSiteError(message, "random.dog", err, res);
				message.channel.send(new RichEmbed()
					.setTitle("Here's your random dog!")
					.setColor(Math.floor(Math.random() * 16777216))
					.setFooter("From random.dog")
					.setImage(JSON.parse(res.body).url)
				);
			});
		}
	},
	class MeIRLCommand extends Command {
		constructor() {
			super({
				name: "meirl",
				description: "Memes that are relatable",
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
			this.cachedSfwPosts = [];
			this.cachedNsfwPosts = [];
			this.lastChecked = 0;
		}
		
		async run(bot, message, args, flags) {
			if (new Date() > this.lastChecked + 1000*7200 || this.cachedPosts.length == 0) {
				const fetchRes = await setCommandPosts(this, "me_irl", false);
				if (fetchRes) return {cmdWarn: fetchRes};
			}
			sendRedditEmbed(this, message, false);
		}
	},
	class MemeCommand extends Command {
		constructor() {
			super({
				name: "meme",
				description: "Gets a meme",
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
			this.cachedPosts = [];
			this.lastChecked = 0;
		}
		
		async run(bot, message, args, flags) {
			if (new Date() > this.lastChecked + 1000*7200 || this.cachedPosts.length == 0) {
				const fetchRes = await setCommandPosts(this, "memes", false);
				if (fetchRes) return {cmdWarn: fetchRes};
			}
			sendRedditEmbed(this, message, false);
		}
	},
	class WholesomeCommand extends Command {
		constructor() {
			super({
				name: "wholesome",
				description: "Animemes that feel good",
				aliases: ["wholesomeanimeme", "wsanimeme"],
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
			this.cachedSfwPosts = [];
			this.cachedNsfwPosts = [];
			this.lastChecked = 0;
		}
		
		async run(bot, message, args, flags) {
			if (new Date() > this.lastChecked + 1000*7200 || this.cachedSfwPosts.length == 0) {
				const fetchRes = await setCommandPosts(this, "wholesomeanimemes", true);
				if (fetchRes) return {cmdWarn: fetchRes};
			}
			sendRedditEmbed(this, message, true);
		}
	}
];