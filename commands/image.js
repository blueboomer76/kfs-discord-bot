const Discord = require("discord.js");
const Command = require("../structures/command.js");
const Jimp = require("jimp");
const request = require("request");

module.exports = [
	class AnimemeCommand extends Command {
		constructor() {
			super({
				name: "animeme",
				description: "Gets an \"animeme\", or simply the combination of anime and memes",
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
			request.get({
				url: `https://reddit.com/r/animemes/hot.json`,
				qs: {limit: 100},
				json: true
			}, (err, res) => {
				if (err || res.statusCode >= 400) return message.channel.send(`Failed to retrieve from Reddit. (status code ${res.statusCode})`)
				
				let results = res.body.data.children.filter(r => !r.data.stickied);
				if (!message.channel.nsfw) results = results.filter(r => !r.data.over_18);
				
				let postData = results[Math.floor(Math.random() * results.length)].data,
					imgResolutions = postData.preview.images[0].resolutions,
					img = imgResolutions.find(r => r.width == 960) ||
						imgResolutions.find(r => r.width == 640) ||
						imgResolutions.find(r => r.width == 320);
				
				message.channel.send(new Discord.RichEmbed()
				.setTitle(`${postData.title.replace(/&amp;/g, "&")}`)
				.setURL(`https://redd.it/${postData.id}`)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter(`👍 ${postData.score} | 💬 ${postData.num_comments} | u/${postData.author}`)
				.setImage(img.url.replace(/&amp;/g, "&"))
				)
			})
		}
	},
	class GreyscaleCommand extends Command {
		constructor() {
			super({
				name: "greyscale",
				description: "Make an image grey",
				aliases: ["gray", "grey", "grayscale"],
				args: [
					{
						num: 1,
						type: "image"
					}
				],
				cooldown: {
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "greyscale <image URL>"
			});
		}
		
		async run(bot, message, args, flags) {
			Jimp.read(args[0])
			.then(img => {
				img.greyscale().getBufferAsync(Jimp.MIME_PNG)
				.then(imgToSend => {
					message.channel.send({
						files: [{
							attachment: imgToSend,
							name: "greyscale.png"
						}]
					})
				})
				.catch(err => {
					message.channel.send("Failed to generate the image.")
				})
			})
			.catch(err => {
				message.channel.send("Failed to get image for that URL.")
			})
		}
	},
	class InvertCommand extends Command {
		constructor() {
			super({
				name: "invert",
				description: "Invert the colors of an image",
				args: [
					{
						num: 1,
						type: "image"
					}
				],
				cooldown: {
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "invert <image URL>"
			});
		}
		
		async run(bot, message, args, flags) {
			Jimp.read(args[0])
			.then(img => {
				img.invert().getBufferAsync(Jimp.MIME_PNG)
				.then(imgToSend => {
					message.channel.send({
						files: [{
							attachment: imgToSend,
							name: "invert.png"
						}]
					})
				})
				.catch(err => {
					message.channel.send("Failed to generate the image.")
				})
			})
			.catch(err => {
				message.channel.send("Failed to get image for that URL.")
			})
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
		}
		
		async run(bot, message, args, flags) {
			request.get({
				url: `https://reddit.com/r/memes/hot.json`,
				qs: {limit: 100},
				json: true
			}, (err, res) => {
				if (err || res.statusCode >= 400) return message.channel.send(`Failed to retrieve from Reddit. (status code ${res.statusCode})`)
				
				let results = res.body.data.children,
					postData = results[Math.floor(Math.random() * results.length)].data,
					imgResolutions = postData.preview.images[0].resolutions,
					img = imgResolutions.find(r => r.width == 960) ||
						imgResolutions.find(r => r.width == 640) ||
						imgResolutions.find(r => r.width == 320);
				
				message.channel.send(new Discord.RichEmbed()
				.setTitle(`${postData.title.replace(/&amp;/g, "&")}`)
				.setURL(`https://redd.it/${postData.id}`)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter(`👍 ${postData.score} | 💬 ${postData.num_comments} | u/${postData.author}`)
				.setImage(img.url.replace(/&amp;/g, "&"))
				)
			})
		}
	}
]