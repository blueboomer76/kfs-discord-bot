const {RichEmbed} = require("discord.js"),
	Command = require("../structures/command.js"),
	request = require("request");

function getPosts(url, checkNsfw) {
	return new Promise((resolve, reject) => {
		request.get({
			url: url,
			json: true
		}, (err, res) => {
			if (err) return reject(`Could not request to Reddit: ${err.message}`);
			if (!res) return reject("No response was received from Reddit.");
			if (res.statusCode >= 400) return reject(`The request to Reddit failed with status code ${res.statusCode} (${res.statusMessage})`);
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
						imageURL: result.data.url
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

function sendRedditEmbed(message, postData) {
	const embedTitle = postData.title.replace(/&amp;/g, "&"),
		imageURL = postData.imageURL,
		redditEmbed = new RichEmbed()
			.setTitle(embedTitle.length > 250 ? `${embedTitle.slice(0, 250)}...` : embedTitle)
			.setURL(`https://reddit.com${postData.url}`)
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter(`👍 ${postData.score} | 💬 ${postData.comments} | By: ${postData.author}`);

	if (/\.(gif|jpe?g|png)$/.test(imageURL)) {
		redditEmbed.setImage(imageURL);
	} else {
		redditEmbed.setDescription(imageURL);
	}

	message.channel.send(redditEmbed);
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
			let cmdErr;
			if (new Date() > this.lastChecked + 1000*7200 || this.cachedPosts.length == 0) {
				await getPosts("https://reddit.com/r/antimeme/hot.json", false)
					.then(posts => {
						this.lastChecked = Number(new Date());
						this.cachedPosts = posts;
					})
					.catch(err => cmdErr = err);
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			const postData = this.cachedPosts.splice(Math.floor(Math.random() * this.cachedPosts.length), 1);
			sendRedditEmbed(message, postData[0]);
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
				if (err) return message.channel.send(`Could not request to random.birb.pw: ${err.message}`);
				if (!res) return message.channel.send("No response was received from random.birb.pw.");
				if (res.statusCode >= 400) return message.channel.send(`The request to random.birb.pw failed with status code ${res.statusCode} (${res.statusMessage})`);
				
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
				if (err) return message.channel.send(`Could not request to random.cat: ${err.message}`);
				if (!res) return message.channel.send("No response was received from random.cat.");
				if (res.statusCode >= 400) return message.channel.send(`The request to random.cat failed with status code ${res.statusCode} (${res.statusMessage})`);
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
				if (err) return message.channel.send(`Could not request to random.dog: ${err.message}`);
				if (!res) return message.channel.send("No response was received from random.dog.");
				if (res.statusCode >= 400) return message.channel.send(`The request to random.dog failed with status code ${res.statusCode} (${res.statusMessage})`);
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
			let cmdErr;
			if (new Date() > this.lastChecked + 1000*7200 || this.cachedSfwPosts.length == 0) {
				this.lastChecked = Number(new Date());
				await getPosts("https://reddit.com/r/me_irl/hot.json", true)
					.then(posts => {
						this.lastChecked = Number(new Date());
						this.cachedSfwPosts = posts.sfw;
						this.cachedNsfwPosts = posts.nsfw;
					})
					.catch(err => cmdErr = err);
				if (cmdErr) return {cmdWarn: cmdErr};
			}
			
			let postData;
			if (!message.channel.nsfw) {
				postData = this.cachedSfwPosts.splice(Math.floor(Math.random() * this.cachedSfwPosts.length), 1);
			} else {
				const postPos = Math.floor(Math.random() * (this.cachedSfwPosts.length + this.cachedNsfwPosts.length));
				if (postPos < this.cachedSfwPosts.length) {
					postData = this.cachedSfwPosts.splice(postPos, 1);
				} else {
					postData = this.cachedNsfwPosts.splice(postPos - this.cachedSfwPosts.length, 1);
				}
			}
			
			sendRedditEmbed(message, postData[0]);
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
			let cmdErr;
			if (new Date() > this.lastChecked + 1000*7200 || this.cachedPosts.length == 0) {
				await getPosts("https://reddit.com/r/memes/hot.json", false)
					.then(posts => {
						this.lastChecked = Number(new Date());
						this.cachedPosts = posts;
					})
					.catch(err => cmdErr = err);
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			const postData = this.cachedPosts.splice(Math.floor(Math.random() * this.cachedPosts.length), 1);
			sendRedditEmbed(message, postData[0]);
		}
	}
];
