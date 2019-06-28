const {RichEmbed} = require("discord.js"),
	Command = require("../structures/command.js"),
	request = require("request");

async function setCommandPosts(command, subreddit, checkNsfw, filterScores) {
	let fetchRes;
	command.lastChecked = Date.now();
	await getPosts(subreddit, checkNsfw, filterScores)
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

function getPosts(subreddit, checkNsfw, filterScores) {
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
			if (filterScores) results = results.filter(r => r.data.score > 0);
		
			if (checkNsfw) {
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
				resolve(results.map(r => {
					return {
						title: r.data.title,
						url: r.data.permalink,
						score: r.data.score,
						comments: r.data.num_comments,
						author: r.data.author,
						imageURL: /v\.redd\.it/.test(r.data.url) && r.data.preview ? r.data.preview.images[0].source.url : r.data.url
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
	if (imageURL.startsWith("https://external-") || /\.(gif|jpe?g|png)$/.test(imageURL)) {
		message.channel.send(new RichEmbed()
			.setTitle(embedTitle.length > 250 ? embedTitle.slice(0, 250) + "..." : embedTitle)
			.setURL("https://reddit.com" + postData.url)
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter(`👍 ${postData.score} | 💬 ${postData.comments} | By: ${postData.author}`)
			.setImage(imageURL));
	} else {
		message.channel.send(`${imageURL} (👍 ${postData.score} | 💬 ${postData.comments} | By: ${postData.author} | ID: ${postData.url.match(/comments\/[0-9a-z]+(?=\/)/)[0].slice(9)})`);
	}
}

module.exports = [
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
			if (Date.now() > this.lastChecked + 1000*7200 || this.cachedPosts.length == 0) {
				const fetchRes = await setCommandPosts(this, "antimeme", false, true);
				if (fetchRes) return {cmdWarn: fetchRes};
			}
			sendRedditEmbed(this, message, false);
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
				const requestRes = bot.checkRemoteRequest("random.birb.pw", err, res);
				if (requestRes != true) return message.channel.send(requestRes);
				message.channel.send(new RichEmbed()
					.setTitle("Here's your random birb!")
					.setColor(Math.floor(Math.random() * 16777216))
					.setFooter("From random.birb.pw")
					.setImage(`https://random.birb.pw/img/${JSON.parse(res.body).file}`)
				);
			});
		}
	},
	class BoneHurtingJuiceCommand extends Command {
		constructor() {
			super({
				name: "bonehurtingjuice",
				description: "Memes redone to be positive and almost wholesome",
				aliases: ["bhj"],
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
			if (Date.now() > this.lastChecked + 1000*7200 || this.cachedSfwPosts.length == 0) {
				const fetchRes = await setCommandPosts(this, "bonehurtingjuice", true, false);
				if (fetchRes) return {cmdWarn: fetchRes};
			}
			sendRedditEmbed(this, message, true);
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
				const requestRes = bot.checkRemoteRequest("random.cat", err, res);
				if (requestRes != true) return message.channel.send(requestRes);
				message.channel.send(new RichEmbed()
					.setTitle("Here's your random cat!")
					.setColor(Math.floor(Math.random() * 16777216))
					.setFooter("From random.cat")
					.setImage(JSON.parse(res.body).file)
				);
			});
		}
	},
	class DiscordIRLCommand extends Command {
		constructor() {
			super({
				name: "discordirl",
				description: "Memes about Discord",
				aliases: ["discordmeme"],
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
			if (Date.now() > this.lastChecked + 1000*7200 || this.cachedSfwPosts.length == 0) {
				const fetchRes = await setCommandPosts(this, "discord_irl", true, true);
				if (fetchRes) return {cmdWarn: fetchRes};
			}
			sendRedditEmbed(this, message, true);
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
				const requestRes = bot.checkRemoteRequest("random.dog", err, res);
				if (requestRes != true) return message.channel.send(requestRes);
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
			if (Date.now() > this.lastChecked + 1000*7200 || this.cachedPosts.length == 0) {
				const fetchRes = await setCommandPosts(this, "me_irl", false, false);
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
					time: 20000,
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
			if (Date.now() > this.lastChecked + 1000*7200 || this.cachedPosts.length == 0) {
				const fetchRes = await setCommandPosts(this, "memes", false, false);
				if (fetchRes) return {cmdWarn: fetchRes};
			}
			sendRedditEmbed(this, message, false);
		}
	}
];
