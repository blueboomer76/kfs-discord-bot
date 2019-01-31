const Command = require("../structures/command.js"),
	imageManager = require("../utils/imageManager.js"),
	Canvas = require("canvas"),
	Jimp = require("jimp");

Canvas.registerFont("assets/Oswald-Regular.ttf", {family: "Oswald"});

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
	class CreateMemeCommand extends Command {
		constructor() {
			super({
				name: "creatememe",
				description: "Makes a custom meme based on an image and some text",
				aliases: ["custommeme", "makememe", "memecreate"],
				args: [
					{
						optional: true,
						shiftable: true,
						type: "image"
					},
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				cooldown: {
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				flags: [
					{
						name: "disablecaps",
						desc: "Allow lowercase letters in the meme"
					}
				],
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "creatememe [image URL] <top text> | [bottom text] [--disable-caps]"
			});
		}
		
		async run(bot, message, args, flags) {			
			const imageURL = args[0] || await imageManager.resolveImageURL(message);
			if (!imageURL) return {cmdWarn: "No image attachment found in recent messages"};

			const pipeRegex = / ?\| /,
				disableCapsFlag = flags.some(f => f.name == "disablecaps");
			let topText, bottomText;
			if (pipeRegex.test(args[1])) {
				const memeTexts = args[1].split(pipeRegex, 2);
				topText = memeTexts[0];
				bottomText = memeTexts[1];
			} else {
				const rawTopText = args[1].slice(0, Math.floor(args[1].length / 2)),
					lastSpaceIndex = rawTopText.lastIndexOf(" ");
				if (lastSpaceIndex != -1) {
					topText = args[1].slice(0, lastSpaceIndex);
					bottomText = args[1].slice(lastSpaceIndex + 1);
				} else {
					const rawBottomText = args[1].slice(Math.floor(args[1].length / 2)),
						lastSpaceIndex2 = rawBottomText.indexOf(" ");
					if (lastSpaceIndex2 != -1) {
						topText = rawTopText + rawBottomText.slice(0, lastSpaceIndex2);
						bottomText = rawBottomText.slice(lastSpaceIndex2 + 1);
					} else {
						topText = args[1];
					}
				}
			}
			if (!disableCapsFlag) {
				topText = topText.toUpperCase();
				if (bottomText) bottomText = bottomText.toUpperCase();
			}

			const img = new Canvas.Image();

			img.onload = () => {
				if (img.width < 100 || img.height < 100) return message.channel.send("You need to use an image 100 x 100 or larger.");
				if (img.width * img.height > 8388608) return message.channel.send("The image is too large.");

				const canvas = Canvas.createCanvas(img.width, img.height),
					ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0);

				ctx.fillStyle = "#ffffff";
				ctx.strokeStyle = "#000000";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";

				this.drawText(canvas, ctx, topText, true);
				if (bottomText) {
					this.drawText(canvas, ctx, bottomText, false);
				}

				message.channel.send("", {
					files: [{
						attachment: canvas.toBuffer(),
						name: "meme.png"
					}]
				});
			};

			imageManager.getCanvasImage(img, imageURL);
		}

		drawText(canvas, ctx, text, isTop) {
			let textFontSize = Math.max(canvas.height / 10, 10);
			ctx.font = `semibold ${Math.floor(textFontSize)}px Oswald`;
			let rawDrawingWidth = ctx.measureText(text).width,
				widthRatio = rawDrawingWidth / canvas.width;
			if (widthRatio > 3) {
				textFontSize /= Math.sqrt(widthRatio / 3);
				ctx.font = `semibold ${Math.floor(textFontSize)}px Oswald`;
				rawDrawingWidth = ctx.measureText(text).width;
				widthRatio = rawDrawingWidth / canvas.width;
			}
			textFontSize = Math.floor(textFontSize);
			ctx.lineWidth = Math.ceil(textFontSize / 16);

			const breakAt = Math.ceil(text.length / widthRatio);
			let remainText = text,
				offset = 0;
			while (remainText.length > 0) {
				let currLine = remainText.slice(0, breakAt);
				if (remainText.length > breakAt) {
					const lastIndex = currLine.lastIndexOf(" ");
					if (lastIndex != -1) {
						currLine = currLine.slice(0, lastIndex);
						remainText = remainText.slice(lastIndex + 1);
					} else {
						remainText = remainText.slice(breakAt);
					}
				} else {
					remainText = "";
				}

				if (isTop) {
					ctx.strokeText(currLine, canvas.width / 2, textFontSize * (offset * 1.2 + 1));
					ctx.fillText(currLine, canvas.width / 2, textFontSize * (offset * 1.2 + 1));
					offset++;
				} else {
					ctx.strokeText(currLine, canvas.width / 2, textFontSize * (offset * -1.2 - 1) + canvas.height);
					ctx.fillText(currLine, canvas.width / 2, textFontSize * (offset * -1.2 - 1) + canvas.height);
					offset--;
				}
			}
		}
	},
	class FlipCommand extends Command {
		constructor() {
			super({
				name: "flip",
				description: "Flip an image vertically",
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
					imageManager.postImage(message, img.mirror(false, true), "flip.png");
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
				description: "Flop an image horizontally",
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
					imageManager.postImage(message, img.mirror(true, false), "flop.png");
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
				aliases: ["gray", "grey", "greyscale"],
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
				usage: "mirror [image URL or mention] <[haah | left-to-right] | [hooh | bottom-to-top] | [waaw | right-to-left] | [woow | top-to-bottom]>"
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

					if (type == "haah" || type == "left-to-right") {
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
					} else if (type == "waaw" || type == "right-to-left") {
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
	class RotateCommand extends Command {
		constructor() {
			super({
				name: "rotate",
				description: "Rotate an image",
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
						name: "degrees",
						desc: "The amount of rotation to apply to the image",
						arg: {
							type: "number",
							min: 1,
							max: 359
						}
					}
				],
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "rotate [image URL or mention] [--degrees <1-359>]"
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
					const degreesFlag = flags.find(f => f.name == "degrees");
					imageManager.postImage(message, img.rotate(degreesFlag ? 360 - degreesFlag.args : 270), "rotate.png");
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
