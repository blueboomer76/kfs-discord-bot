const Command = require("../structures/command.js"),
	imageManager = require("../utils/imageManager.js"),
	Jimp = require("jimp");

function getPixelFactor(img) {
	return Math.ceil(img.bitmap.width > img.bitmap.height ? img.bitmap.width : img.bitmap.height) / 100;
}

module.exports = [
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
							min: 1
						}
					}
				],
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "blur [image URL or mention] [--level <number>]"
			});
		}
		
		async run(bot, message, args, flags) {
			let imageURL = args[0];
			if (!imageURL) {
				imageURL = await imageManager.resolveImageURL(message);
				if (!imageURL) return {cmdWarn: "No image attachment found in recent messages"};
			}
			
			Jimp.read(imageURL)
				.then(img => {
					const levelFlag = flags.find(f => f.name == "level");
					let blurLevel;
					if (levelFlag) {
						blurLevel = levelFlag.args;
					} else {
						blurLevel = getPixelFactor(img);
					}
					imageManager.postImage(message, img.blur(blurLevel), "blur.png");
				})
				.catch(() => {
					message.channel.send("⚠ Failed to get image for that URL.");
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
			let imageURL = args[0];
			if (!imageURL) {
				imageURL = await imageManager.resolveImageURL(message);
				if (!imageURL) return {cmdWarn: "No image attachment found in recent messages"};
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
			let imageURL = args[0];
			if (!imageURL) {
				imageURL = await imageManager.resolveImageURL(message);
				if (!imageURL) return {cmdWarn: "No image attachment found in recent messages"};
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
			let imageURL = args[0];
			if (!imageURL) {
				imageURL = await imageManager.resolveImageURL(message);
				if (!imageURL) return {cmdWarn: "No image attachment found in recent messages"};
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
			let imageURL = args[0];
			if (!imageURL) {
				imageURL = await imageManager.resolveImageURL(message);
				if (!imageURL) return {cmdWarn: "No image attachment found in recent messages"};
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
			let imageURL = args[0];
			
			if (!imageURL) {
				imageURL = await imageManager.resolveImageURL(message);
				if (!imageURL) return {cmdWarn: "No image attachment found in recent messages"};
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
			let imageURL = args[0];
			if (!imageURL) {
				imageURL = await imageManager.resolveImageURL(message);
				if (!imageURL) return {cmdWarn: "No image attachment found in recent messages"};
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
			let imageURL = args[0];
			if (!imageURL) {
				imageURL = await imageManager.resolveImageURL(message);
				if (!imageURL) return {cmdWarn: "No image attachment found in recent messages"};
			}
			
			Jimp.read(imageURL)
				.then(img => {
					imageManager.postImage(message, img.pixelate(getPixelFactor(img)), "pixelate.png");
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
			let imageURL = args[0];
			if (!imageURL) {
				imageURL = await imageManager.resolveImageURL(message);
				if (!imageURL) return {cmdWarn: "No image attachment found in recent messages"};
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
