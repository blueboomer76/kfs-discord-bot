const Discord = require("discord.js");
const Command = require("../structures/command.js");
const imageManager = require("../utils/imageManager.js");
const Jimp = require("jimp");
const request = require("request");

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
	class BlurCommand extends Command {
		constructor() {
			super({
				name: "blur",
				description: "Blur an image",
				args: [
					{
						optional: true,
						type: "image"
					},
				],
				cooldown: {
					time: 20000,
					type: "channel"
				},
				flags: [
					{
						name: "level",
						desc: "The level to blur the image",
						arg: {
							type: "number",
							min: 1,
							max: 10
						}
					}
				],
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "blur [image URL] [--level <1-10>]"
			});
		}
		
		async run(bot, message, args, flags) {
			let imageURL = args[0], cmdErr;
			if (!imageURL) {
				await imageManager.getRecentImage(message)
				.then(url => imageURL = url)
				.catch(err => cmdErr = err)
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			Jimp.read(imageURL)
			.then(img => {
				let levelFlag = flags.find(f => f.name == "level");
				imageManager.postImage(message, img.blur(levelFlag ? levelFlag.args[0] : 2), "blur.png")
			})
			.catch(err => {
				message.channel.send("Failed to get image for that URL.")
			})
		}
	},
	class FlipCommand extends Command {
		constructor() {
			super({
				name: "flip",
				description: "Flip an image horizontally",
				args: [
					{
						optional: true,
						type: "image"
					},
				],
				cooldown: {
					time: 20000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "flip [image URL]"
			});
		}
		
		async run(bot, message, args, flags) {
			let imageURL = args[0], cmdErr;
			if (!imageURL) {
				await imageManager.getRecentImage(message)
				.then(url => imageURL = url)
				.catch(err => cmdErr = err)
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			Jimp.read(imageURL)
			.then(img => {
				imageManager.postImage(message, img.mirror(true, false), "flip.png")
			})
			.catch(err => {
				message.channel.send("Failed to get image for that URL.")
			})
		}
	},
	class FlopCommand extends Command {
		constructor() {
			super({
				name: "flop",
				description: "Flop an image vertically",
				args: [
					{
						optional: true,
						type: "image"
					},
				],
				cooldown: {
					time: 20000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "flop [image URL]"
			});
		}
		
		async run(bot, message, args, flags) {
			let imageURL = args[0], cmdErr;
			if (!imageURL) {
				await imageManager.getRecentImage(message)
				.then(url => imageURL = url)
				.catch(err => cmdErr = err)
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			Jimp.read(imageURL)
			.then(img => {
				imageManager.postImage(message, img.mirror(false, true), "flop.png")
			})
			.catch(err => {
				message.channel.send("Failed to get image for that URL.")
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
						optional: true,
						type: "image"
					}
				],
				cooldown: {
					time: 20000,
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
			let imageURL = args[0], cmdErr;
			if (!imageURL) {
				await imageManager.getRecentImage(message)
				.then(url => imageURL = url)
				.catch(err => cmdErr = err)
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			Jimp.read(imageURL)
			.then(img => {
				imageManager.postImage(message, img.greyscale(), "greyscale.png")
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
						optional: true,
						type: "image"
					}
				],
				cooldown: {
					time: 20000,
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
			let imageURL = args[0], cmdErr;
			if (!imageURL) {
				await imageManager.getRecentImage(message)
				.then(url => imageURL = url)
				.catch(err => cmdErr = err)
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			Jimp.read(imageURL)
			.then(img => {
				imageManager.postImage(message, img.invert(), "invert.png")
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
	},
	class MirrorCommand extends Command {
		constructor() {
			super({
				name: "mirror",
				description: "Mirrors a half of an image to the other side",
				args: [
					{
						type: "image",
					},
					{
						type: "oneof",
						allowedValues: ["haah", "hooh", "waaw", "woow", "bottom-to-top", "top-to-bottom", "left-to-right", "right-to-left"]
					}
				],
				cooldown: {
					time: 20000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "mirror <image URL> <[haah | right-to-left] | [hooh | bottom-to-top] | [waaw | left-to-right] | [woow | top-to-bottom]>"
			});
		}
		
		async run(bot, message, args, flags) {
			let imageURL = args[0], type = args[1], cmdErr;
			
			Jimp.read(imageURL)
			.then(img => {
				let imgToSend,
					imgClone1 = img.clone(),
					imgClone2 = img.clone(),
					imgWidth = img.bitmap.width,
					imgHeight = img.bitmap.height;
					
				if (type == "haah" || type == "right-to-left") {
					imgClone1.crop(imgWidth/2,0,imgWidth/2,imgHeight);
					imgClone2.crop(imgWidth/2,0,imgWidth/2,imgHeight);
					imgClone2.mirror(true, false);
					
					imgToSend = new Jimp(imgWidth, imgHeight, (err, img2) => {
						img2.composite(imgClone1,imgWidth/2,0)
						img2.composite(imgClone2,0,0)
						imageManager.postImage(message, img2, "mirror-haah.png")
					})
					return;
				} else if (type == "hooh" || type == "bottom-to-top") {
					imgClone1.crop(0,imgHeight/2,imgWidth,imgHeight/2);
					imgClone2.crop(0,imgHeight/2,imgWidth,imgHeight/2);
					imgClone2.mirror(false, true);
					
					imgToSend = new Jimp(imgWidth, imgHeight, (err, img2) => {
						img2.composite(imgClone1,0,imgHeight/2)
						.composite(imgClone2,0,0)
						imageManager.postImage(message, img2, "mirror-hooh.png")
					})
				} else if (type == "waaw" || type == "left-to-right") {
					imgClone1.crop(0,0,imgWidth/2,imgHeight);
					imgClone2.crop(0,0,imgWidth/2,imgHeight);
					imgClone2.mirror(true, false);
					
					imgToSend = new Jimp(imgWidth, imgHeight, (err, img2) => {
						img2.composite(imgClone1,0,0)
						.composite(imgClone2,imgWidth/2,0)
						imageManager.postImage(message, img2, "mirror-waaw.png")
					})
				} else {
					imgClone1.crop(0,0,imgWidth,imgHeight/2);
					imgClone2.crop(0,0,imgWidth,imgHeight/2);
					imgClone2.mirror(false, true);
					
					imgToSend = new Jimp(imgWidth, imgHeight, (err, img2) => {
						img2.composite(imgClone1,0,0)
						.composite(imgClone2,0,imgHeight/2)
						imageManager.postImage(message, img2, "mirror-woow.png")
					})
				}
			})
			.catch(err => {
				message.channel.send("Failed to get image for that URL.")
			})
		}
	},
]