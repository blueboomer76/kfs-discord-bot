const {RichEmbed} = require("discord.js"),
	Command = require("../structures/command.js"),
	imageManager = require("../utils/imageManager.js"),
	Jimp = require("jimp"),
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
	const title = postData.title.replace(/&amp;/g, "&");
	message.channel.send(new RichEmbed()
		.setTitle(title.length > 250 ? `${title.slice(0, 250)}...` : title)
		.setURL(`https://reddit.com${postData.url}`)
		.setColor(Math.floor(Math.random() * 16777216))
		.setFooter(`👍 ${postData.score} | 💬 ${postData.comments} | By: ${postData.author}`)
		.setImage(postData.imageURL)
	);
}

module.exports = [
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
	class BlurCommand extends Command {
		constructor() {
			super({
				name: "blur",
				description: "Blur an image",
				args: [
					{
						optional: true,
						type: "image"
					}
				],
				cooldown: {
					name: "image-editing",
					time: 15000,
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
				usage: "blur [image URL or mention] [--level <1-10>]"
			});
		}
		
		async run(bot, message, args, flags) {
			let imageURL = args[0], cmdErr;
			if (!imageURL) {
				await imageManager.resolveImageURL(message)
					.then(url => imageURL = url)
					.catch(err => cmdErr = err);
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			Jimp.read(imageURL)
				.then(img => {
					const levelFlag = flags.find(f => f.name == "level");
					imageManager.postImage(message, img.blur(levelFlag ? levelFlag.args : 2), "blur.png");
				})
				.catch(() => {
					message.channel.send("⚠ Failed to get image for that URL.");
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
	class FlipCommand extends Command {
		constructor() {
			super({
				name: "flip",
				description: "Flip an image horizontally",
				args: [
					{
						optional: true,
						type: "image"
					}
				],
				cooldown: {
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "flip [image URL or mention]"
			});
		}
		
		async run(bot, message, args, flags) {
			let imageURL = args[0], cmdErr;
			if (!imageURL) {
				await imageManager.resolveImageURL(message)
					.then(url => imageURL = url)
					.catch(err => cmdErr = err);
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			Jimp.read(imageURL)
				.then(img => {
					imageManager.postImage(message, img.mirror(true, false), "flip.png");
				})
				.catch(() => {
					message.channel.send("⚠ Failed to get image for that URL.");
				});
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
					}
				],
				cooldown: {
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "flop [image URL or mention]"
			});
		}
		
		async run(bot, message, args, flags) {
			let imageURL = args[0], cmdErr;
			if (!imageURL) {
				await imageManager.resolveImageURL(message)
					.then(url => imageURL = url)
					.catch(err => cmdErr = err);
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			Jimp.read(imageURL)
				.then(img => {
					imageManager.postImage(message, img.mirror(false, true), "flop.png");
				})
				.catch(() => {
					message.channel.send("⚠ Failed to get image for that URL.");
				});
		}
	},
	class GrayscaleCommand extends Command {
		constructor() {
			super({
				name: "grayscale",
				description: "Make an image gray",
				aliases: ["grayscale", "grey", "greyscale"],
				args: [
					{
						optional: true,
						type: "image"
					}
				],
				cooldown: {
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "grayscale [image URL or mention]"
			});
		}
		
		async run(bot, message, args, flags) {
			let imageURL = args[0], cmdErr;
			if (!imageURL) {
				await imageManager.resolveImageURL(message)
					.then(url => imageURL = url)
					.catch(err => cmdErr = err);
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			Jimp.read(imageURL)
				.then(img => {
					imageManager.postImage(message, img.grayscale(), "grayscale.png");
				})
				.catch(() => {
					message.channel.send("⚠ Failed to get image for that URL.");
				});
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
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "invert [image URL or mention]"
			});
		}
		
		async run(bot, message, args, flags) {
			let imageURL = args[0], cmdErr;
			if (!imageURL) {
				await imageManager.resolveImageURL(message)
					.then(url => imageURL = url)
					.catch(err => cmdErr = err);
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			Jimp.read(imageURL)
				.then(img => {
					imageManager.postImage(message, img.invert(), "invert.png");
				})
				.catch(() => {
					message.channel.send("⚠ Failed to get image for that URL.");
				});
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
			if (new Date() > this.lastChecked + 1000*3600 || this.cachedPosts.length == 0) {
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
	},
	class MirrorCommand extends Command {
		constructor() {
			super({
				name: "mirror",
				description: "Mirrors a half of an image to the other side",
				args: [
					{
						type: "image",
						shiftable: true
					},
					{
						type: "oneof",
						allowedValues: ["haah", "hooh", "waaw", "woow", "bottom-to-top", "top-to-bottom", "left-to-right", "right-to-left"]
					}
				],
				cooldown: {
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "mirror [image URL or mention] <[haah | right-to-left] | [hooh | bottom-to-top] | [waaw | left-to-right] | [woow | top-to-bottom]>"
			});
		}
		
		async run(bot, message, args, flags) {
			const type = args[1];
			let imageURL = args[0], cmdErr;
			
			if (!imageURL) {
				await imageManager.resolveImageURL(message)
					.then(url => imageURL = url)
					.catch(err => cmdErr = err);
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			Jimp.read(imageURL)
				.then(img => {
					const imgClone1 = img.clone(),
						imgClone2 = img.clone(),
						imgWidth = img.bitmap.width,
						imgHeight = img.bitmap.height;

					if (type == "haah" || type == "right-to-left") {
						imgClone1.crop(imgWidth / 2, 0, imgWidth / 2, imgHeight);
						imgClone2.crop(imgWidth / 2, 0, imgWidth / 2, imgHeight);
						imgClone2.mirror(true, false);
						
						new Jimp(imgWidth, imgHeight, (err, img2) => {
							img2.composite(imgClone1, imgWidth / 2, 0)
								.composite(imgClone2, 0, 0);
							imageManager.postImage(message, img2, "mirror-haah.png");
						});
						return;
					} else if (type == "hooh" || type == "bottom-to-top") {
						imgClone1.crop(0, imgHeight / 2, imgWidth, imgHeight / 2);
						imgClone2.crop(0, imgHeight / 2, imgWidth, imgHeight / 2);
						imgClone2.mirror(false, true);
						
						new Jimp(imgWidth, imgHeight, (err, img2) => {
							img2.composite(imgClone1, 0, imgHeight / 2)
								.composite(imgClone2, 0, 0);
							imageManager.postImage(message, img2, "mirror-hooh.png");
						});
					} else if (type == "waaw" || type == "left-to-right") {
						imgClone1.crop(0, 0, imgWidth / 2, imgHeight);
						imgClone2.crop(0, 0, imgWidth / 2, imgHeight);
						imgClone2.mirror(true, false);
						
						new Jimp(imgWidth, imgHeight, (err, img2) => {
							img2.composite(imgClone1, 0, 0)
								.composite(imgClone2, imgWidth / 2, 0);
							imageManager.postImage(message, img2, "mirror-waaw.png");
						});
					} else {
						imgClone1.crop(0, 0, imgWidth, imgHeight / 2);
						imgClone2.crop(0, 0, imgWidth, imgHeight / 2);
						imgClone2.mirror(false, true);
						
						new Jimp(imgWidth, imgHeight, (err, img2) => {
							img2.composite(imgClone1, 0, 0)
								.composite(imgClone2, 0, imgHeight / 2);
							imageManager.postImage(message, img2, "mirror-woow.png");
						});
					}
				})
				.catch(() => {
					message.channel.send("⚠ Failed to get image for that URL.");
				});
		}
	},
	class NeedsMoreJPEGCommand extends Command {
		constructor() {
			super({
				name: "needsmorejpeg",
				description: "Add more JPEG to an image",
				aliases: ["jpeg", "morejpeg", "needsmorejpg"],
				args: [
					{
						optional: true,
						type: "image"
					}
				],
				cooldown: {
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "needsmorejpeg [image URL or mention]"
			});
		}
		
		async run(bot, message, args, flags) {
			let imageURL = args[0], cmdErr;
			if (!imageURL) {
				await imageManager.resolveImageURL(message)
					.then(url => imageURL = url)
					.catch(err => cmdErr = err);
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			Jimp.read(imageURL)
				.then(img => {
					img.quality(1)
						.getBufferAsync(Jimp.MIME_JPEG)
						.then(imgToSend => {
							message.channel.send({
								files: [{
									attachment: imgToSend,
									name: "needsmorejpeg.jpg"
								}]
							});
						})
						.catch(() => {
							message.channel.send("Failed to generate the image.");
						});
				})
				.catch(() => {
					message.channel.send("⚠ Failed to get image for that URL.");
				});
		}
	},
	class PixelateCommand extends Command {
		constructor() {
			super({
				name: "pixelate",
				description: "Pixelates an image",
				aliases: ["pixel"],
				args: [
					{
						optional: true,
						type: "image"
					}
				],
				cooldown: {
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "pixelate [image URL or mention]"
			});
		}
		
		async run(bot, message, args, flags) {
			let imageURL = args[0], cmdErr;
			if (!imageURL) {
				await imageManager.resolveImageURL(message)
					.then(url => imageURL = url)
					.catch(err => cmdErr = err);
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			Jimp.read(imageURL)
				.then(img => {
					imageManager.postImage(message, img.pixelate(10), "pixelate.png");
				})
				.catch(() => {
					message.channel.send("⚠ Failed to get image for that URL.");
				});
		}
	},
	class SepiaCommand extends Command {
		constructor() {
			super({
				name: "sepia",
				description: "Apply a sepia filter to an image",
				args: [
					{
						optional: true,
						type: "image"
					}
				],
				cooldown: {
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "sepia [image URL or mention]"
			});
		}
		
		async run(bot, message, args, flags) {
			let imageURL = args[0], cmdErr;
			if (!imageURL) {
				await imageManager.resolveImageURL(message)
					.then(url => imageURL = url)
					.catch(err => cmdErr = err);
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			Jimp.read(imageURL)
				.then(img => {
					imageManager.postImage(message, img.sepia(), "sepia.png");
				})
				.catch(() => {
					message.channel.send("⚠ Failed to get image for that URL.");
				});
		}
	}
];
