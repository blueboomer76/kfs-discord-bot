const Command = require("../structures/command.js"),
	imageManager = require("../utils/imageManager.js"),
	Canvas = require("canvas"),
	gifencoder = require("gifencoder"),
	Jimp = require("jimp");

Canvas.registerFont("assets/Oswald-Regular.ttf", {family: "Oswald"});

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
					},
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
				usage: "blur [image URL/mention/emoji] [--level <number>]"
			});
		}
		
		async run(bot, message, args, flags) {
			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};
			
			const levelFlag = flags.find(f => f.name == "level");
			imageManager.applyJimpFilterAndPost(message, fetchedImg.data, "blur", {blur: levelFlag ? levelFlag.args[0] : null});
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
						name: "disable-caps",
						desc: "Allow lowercase letters in the meme"
					}
				],
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "creatememe [image URL] <text> | [bottom text] [--disable-caps]"
			});
		}
		
		async run(bot, message, args, flags) {
			if (args[1].length > 400) return {cmdWarn: "The top and bottom text cannot be more than 400 characters in total."};

			const pipeRegex = / ?\| /,
				disableCapsFlag = flags.some(f => f.name == "disable-caps");
			let topText, bottomText;
			if (pipeRegex.test(args[1])) {
				const memeTexts = args[1].split(/ ?\| /, 2);
				topText = memeTexts[0];
				bottomText = memeTexts[1];
			} else {
				const topText2 = args[1].slice(0, Math.floor(args[1].length / 2)),
					lastIndex2 = topText2.lastIndexOf(" ");
				
				if (lastIndex2 != -1) {
					topText = args[1].slice(0, lastIndex2);
					bottomText = args[1].slice(lastIndex2);
				} else {
					const lastIndex3 = args[1].lastIndexOf(" ");
					if (lastIndex3 != -1) {
						topText = args[1].slice(0, lastIndex3);
						bottomText = args[1].slice(lastIndex3);
					} else {
						topText = args[1];
					}
				}
			}
			topText = disableCapsFlag ? topText : topText.toUpperCase();
			bottomText = disableCapsFlag || !bottomText ? bottomText : bottomText.toUpperCase();

			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};
			
			const img = new Canvas.Image();

			imageManager.getCanvasImage(img, fetchedImg.data, args[0] && args[0].isEmoji, () => {
				if (img.width < 100 || img.height < 100) return message.channel.send("Your image is too small, please enlarge it first or try another image.");

				const canvas = Canvas.createCanvas(img.width, img.height),
					ctx = canvas.getContext("2d"),
					topTextFontSize = (topText.length > 100 ? 3600 / topText.length : 36) * (img.width / 500);

				ctx.drawImage(img, 0, 0);

				ctx.fillStyle = "#ffffff";
				ctx.font = `semibold ${topTextFontSize}px Oswald`;
				ctx.lineWidth = 4;
				ctx.strokeStyle = "#000000";
				ctx.textAlign = "center";

				const breakAt = Math.floor(topText.length * img.width * 0.8 / ctx.measureText(topText).width);
				let remainTopText = topText, i = 1;
				while (remainTopText.length > 0) {
					let currLine = remainTopText.slice(0, breakAt);
					if (remainTopText.length > breakAt) {
						const lastIndex = currLine.lastIndexOf(" ");
						if (lastIndex != -1) {
							currLine = currLine.slice(0, lastIndex);
							remainTopText = remainTopText.slice(lastIndex);
						} else {
							remainTopText = remainTopText.slice(breakAt);
						}
					} else {
						remainTopText = "";
					}

					ctx.strokeText(currLine, canvas.width / 2, topTextFontSize * i * 1.2 + 10);
					ctx.fillText(currLine, canvas.width / 2, topTextFontSize * i * 1.2 + 10);
					i++;
				}
				if (bottomText) {
					const bottomTextFontSize = (bottomText.length > 100 ? 3600 / bottomText.length : 36) * (img.width / 500);
					ctx.font = `semibold ${bottomTextFontSize}px Oswald`;

					let remainBottomText = bottomText, j = Math.floor(bottomText.length / breakAt);
					while (remainBottomText.length > 0) {
						let currLine = remainBottomText.slice(0, breakAt);
						if (remainBottomText.length > breakAt) {
							const lastIndex = currLine.lastIndexOf(" ");
							if (lastIndex != -1) {
								currLine = currLine.slice(0, lastIndex);
								remainBottomText = remainBottomText.slice(lastIndex);
							} else {
								remainBottomText = remainBottomText.slice(breakAt);
							}
						} else {
							remainBottomText = "";
						}

						ctx.strokeText(currLine, canvas.width / 2, bottomTextFontSize * j * -1.2 + img.height - 10);
						ctx.fillText(currLine, canvas.width / 2, bottomTextFontSize * j * -1.2 + img.height - 10);
						j--;
					}
				}

				message.channel.send("", {
					files: [{
						attachment: canvas.toBuffer(),
						name: "meme.png"
					}]
				});
			})
				.catch(err => message.channel.send("⚠ " + err));
		}
	},
	class DeepFryCommand extends Command {
		constructor() {
			super({
				name: "deepfry",
				description: "Deep fries an image",
				aliases: ["fry"],
				args: [
					{
						optional: true,
						type: "image"
					},
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
				usage: "deepfry [image URL/mention/emoji]"
			});
		}
		
		async run(bot, message, args, flags) {
			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};
			
			Jimp.read(fetchedImg.data)
				.then(img => {
					img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, i) => {
						img.bitmap.data[i] = img.bitmap.data[i] < 144 ? 0 : 255;
						img.bitmap.data[i+1] = img.bitmap.data[i+1] < 144 ? 0 : 255;
						img.bitmap.data[i+2] = img.bitmap.data[i+2] < 144 ? 0 : 255;
					});
					img.quality(1)
						.getBufferAsync(Jimp.MIME_JPEG)
						.then(imgToSend => {
							message.channel.send({
								files: [{attachment: imgToSend, name: "deepfry.png"}]
							});
						})
						.catch(() => message.channel.send("⚠ Failed to generate the image."));
				})
				.catch(() => message.channel.send("⚠ Failed to read image contents."));
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
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "flip [image URL/mention/emoji]"
			});
		}
		
		async run(bot, message, args, flags) {
			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};
			
			imageManager.applyJimpFilterAndPost(message, fetchedImg.data, "flip");
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
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "flop [image URL/mention/emoji]"
			});
		}
		
		async run(bot, message, args, flags) {
			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};
			
			imageManager.applyJimpFilterAndPost(message, fetchedImg.data, "flop");
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
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "greyscale [image URL/mention/emoji]"
			});
		}
		
		async run(bot, message, args, flags) {
			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};
			
			imageManager.applyJimpFilterAndPost(message, fetchedImg.data, "greyscale");
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
				usage: "invert [image URL/mention/emoji]"
			});
		}
		
		async run(bot, message, args, flags) {
			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};
			
			imageManager.applyJimpFilterAndPost(message, fetchedImg.data, "invert");
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
				examples: [
					"mirror 😍 top-to-bottom"
				],
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "mirror [image URL/mention/emoji] <(haah | right-to-left) | (hooh | bottom-to-top) | (waaw | left-to-right) | (woow | top-to-bottom)>"
			});
		}
		
		async run(bot, message, args, flags) {
			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};
			
			const type = args[1];
			Jimp.read(fetchedImg.data)
				.then(img => {
					const imgClone1 = img.clone(),
						imgClone2 = img.clone(),
						imgWidth = img.bitmap.width,
						imgHeight = img.bitmap.height;

					if (type == "haah" || type == "right-to-left") {
						imgClone1.crop(imgWidth/2,0,imgWidth/2,imgHeight);
						imgClone2.crop(imgWidth/2,0,imgWidth/2,imgHeight);
						imgClone2.mirror(true, false);
						
						new Jimp(imgWidth, imgHeight, (err, img2) => {
							img2.composite(imgClone1,imgWidth/2,0);
							img2.composite(imgClone2,0,0);
							imageManager.postJimpImage(message, img2, "mirror-haah.png");
						});
						return;
					} else if (type == "hooh" || type == "bottom-to-top") {
						imgClone1.crop(0,imgHeight/2,imgWidth,imgHeight/2);
						imgClone2.crop(0,imgHeight/2,imgWidth,imgHeight/2);
						imgClone2.mirror(false, true);
						
						new Jimp(imgWidth, imgHeight, (err, img2) => {
							img2.composite(imgClone1,0,imgHeight/2).composite(imgClone2,0,0);
							imageManager.postJimpImage(message, img2, "mirror-hooh.png");
						});
					} else if (type == "waaw" || type == "left-to-right") {
						imgClone1.crop(0,0,imgWidth/2,imgHeight);
						imgClone2.crop(0,0,imgWidth/2,imgHeight);
						imgClone2.mirror(true, false);
						
						new Jimp(imgWidth, imgHeight, (err, img2) => {
							img2.composite(imgClone1,0,0).composite(imgClone2,imgWidth/2,0);
							imageManager.postJimpImage(message, img2, "mirror-waaw.png");
						});
					} else {
						imgClone1.crop(0,0,imgWidth,imgHeight/2);
						imgClone2.crop(0,0,imgWidth,imgHeight/2);
						imgClone2.mirror(false, true);
						
						new Jimp(imgWidth, imgHeight, (err, img2) => {
							img2.composite(imgClone1,0,0).composite(imgClone2,0,imgHeight/2);
							imageManager.postJimpImage(message, img2, "mirror-woow.png");
						});
					}
				})
				.catch(() => {
					message.channel.send("⚠ Failed to read image contents.");
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
					},
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
				usage: "needsmorejpeg [image URL/mention/emoji]"
			});
		}
		
		async run(bot, message, args, flags) {
			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};
			
			Jimp.read(fetchedImg.data)
				.then(img => {
					img.quality(1)
						.getBufferAsync(Jimp.MIME_JPEG)
						.then(imgToSend => {
							message.channel.send({
								files: [{attachment: imgToSend, name: "needsmorejpeg.jpg"}]
							});
						})
						.catch(() => message.channel.send("⚠ Failed to generate the image."));
				})
				.catch(() => message.channel.send("⚠ Failed to read image contents."));
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
					},
				],
				cooldown: {
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				flags: [
					{
						name: "pixels",
						desc: "The width of each enlarged pixel",
						type: "number",
						min: 1
					}
				],
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "pixelate [image URL/mention/emoji] [--pixels <number>]"
			});
		}
		
		async run(bot, message, args, flags) {
			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};
			
			const pixelsFlag = flags.find(f => f.name == "pixels");
			imageManager.applyJimpFilterAndPost(message, fetchedImg.data, "pixelate", {pixels: pixelsFlag ? pixelsFlag.args[0] : null});
		}
	},
	class RandomCropCommand extends Command {
		constructor() {
			super({
				name: "randomcrop",
				description: "Crops an image randomly",
				aliases: ["randcrop"],
				args: [
					{
						optional: true,
						type: "image"
					},
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
				usage: "randomcrop [image URL/mention/emoji]"
			});
		}
		
		async run(bot, message, args, flags) {
			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};
			
			imageManager.applyJimpFilterAndPost(message, fetchedImg.data, "randomcrop");
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
					},
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
				usage: "rotate [image URL/mention/emoji] [--degrees <1-359>]"
			});
		}
		
		async run(bot, message, args, flags) {
			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};
			
			const degreesFlag = flags.find(f => f.name == "degrees");
			imageManager.applyJimpFilterAndPost(message, fetchedImg.data, "rotate", {rotation: degreesFlag ? degreesFlag.args[0] : null});
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
					},
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
				usage: "sepia [image URL/mention/emoji]"
			});
		}
		
		async run(bot, message, args, flags) {
			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};
			
			imageManager.applyJimpFilterAndPost(message, fetchedImg.data, "sepia");
		}
	},
	class SpinCommand extends Command {
		constructor() {
			super({
				name: "spin",
				description: "Spin someone or something!",
				aliases: ["rotategif"],
				args: [
					{
						optional: true,
						type: "image"
					},
				],
				cooldown: {
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				flags: [
					{
						name: "speed",
						desc: "Sets GIF speed",
						arg: {
							type: "number",
							min: 1,
							max: 5
						}
					}
				],
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "spin [image URL/mention/emoji] [--speed <1-5>]"
			});
		}
		
		async run(bot, message, args, flags) {
			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};

			const speedFlag = flags.find(f => f.name == "speed"),
				img = new Canvas.Image();
			
			imageManager.getCanvasImage(img, fetchedImg.data, args[0] && args[0].isEmoji, () => {
				let canvasDim = img.width < img.height ? img.width : img.height,
					imgScale = 1,
					imgX = 0,
					imgY = 0;
				if (canvasDim < 250) {
					imgScale = 250 / canvasDim;
				} else if (canvasDim > 800) {
					imgScale = 800 / canvasDim;
				}
				const imgWidth = img.width * imgScale, imgHeight = img.height * imgScale;
				canvasDim *= imgScale;
				if (imgWidth > imgHeight) {
					imgX = -Math.floor((imgWidth - canvasDim) / 2);
				} else if (imgHeight > imgWidth) {
					imgY = -Math.floor((imgHeight - canvasDim) / 2);
				}

				const ctx = Canvas.createCanvas(canvasDim, canvasDim).getContext("2d"),
					encoder = new gifencoder(canvasDim, canvasDim),
					stream = encoder.createReadStream();
				
				encoder.start();
				encoder.setRepeat(0);
				encoder.setDelay(speedFlag ? (6 - speedFlag.args[0]) * 20 : 60);
				ctx.beginPath();
				ctx.arc(canvasDim / 2, canvasDim / 2, canvasDim / 2, 0, Math.PI*2);
				ctx.stroke();
				ctx.closePath();
				ctx.clip();

				for (let i = 0; i < 24; i++) {
					ctx.translate(imgX + imgWidth / 2, imgY + imgHeight / 2);
					ctx.rotate(Math.PI / 12);
					ctx.translate(-(imgX + imgWidth / 2), -(imgY + imgHeight / 2));
					ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
					encoder.addFrame(ctx);
					ctx.fillRect(0, 0, canvasDim, canvasDim);
				}
				encoder.finish();

				message.channel.send("", {
					files: [{
						attachment: stream,
						name: "spin.gif"
					}]
				});
			})
				.catch(err => message.channel.send("⚠ " + err));
		}
	},
	class TriggeredCommand extends Command {
		constructor() {
			super({
				name: "triggered",
				description: "Makes a triggered GIF!",
				aliases: ["trigger"],
				args: [
					{
						optional: true,
						type: "image"
					},
				],
				cooldown: {
					name: "image-editing",
					time: 15000,
					type: "channel"
				},
				flags: [
					{
						name: "level",
						desc: "Sets trigger intensity",
						arg: {
							type: "number",
							min: 1,
							max: 5
						}
					}
				],
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "triggered [image URL/mention/emoji] [--level <1-5>]"
			});
		}
		
		async run(bot, message, args, flags) {
			const fetchedImg = await imageManager.getImageResolvable(message, args[0]);
			if (fetchedImg.error) return {cmdWarn: fetchedImg.error};

			const levelFlag = flags.find(f => f.name == "level"),
				multiplier = levelFlag ? levelFlag.args[0] * 15 : 45,
				multiplier2 = multiplier - 15,
				triggerImg = await Canvas.loadImage("assets/images/triggered.png"),
				img = new Canvas.Image();
			
			imageManager.getCanvasImage(img, fetchedImg.data, args[0] && args[0].isEmoji, () => {
				let imgScale = 1,
					imgWidth = img.width,
					imgHeight = img.height,
					imgY = 0;
				if (img.width < 250) {
					imgScale = 250 / img.width;
				} else if (img.width > 800) {
					imgScale = 800 / img.width;
				}
				imgWidth = img.width * imgScale;
				imgHeight = img.height * imgScale;
				if (imgHeight > 800) imgY = -((imgHeight - 800) / 2);
				const triggerHeight = imgHeight > 350 ? 150 : (imgHeight > 250 ? (imgHeight - 250) * 0.5 + 100 : 100),
					canvasWidth = Math.floor(imgWidth),
					canvasHeight = Math.floor((imgHeight < 800 ? imgHeight : 800) + triggerHeight),
					ctx = Canvas.createCanvas(canvasWidth, canvasHeight).getContext("2d"),
					encoder = new gifencoder(canvasWidth, canvasHeight),
					stream = encoder.createReadStream();
				
				encoder.start();
				encoder.setRepeat(0);
				encoder.setDelay(40);
				for (let i = 0; i < 8; i++) {
					ctx.drawImage(img, Math.floor(multiplier * (Math.random() - 0.5)), imgY + Math.floor(multiplier * (Math.random() - 0.5)), Math.floor(imgWidth), Math.floor(imgHeight));
					ctx.drawImage(triggerImg, Math.floor(multiplier2 * (Math.random() - 0.5)), Math.floor(multiplier2 * (Math.random() - 0.5)) + canvasHeight - triggerHeight, canvasWidth, triggerHeight);
					encoder.addFrame(ctx);
					ctx.fillRect(0, 0, canvasWidth, canvasHeight);
				}
				encoder.finish();

				message.channel.send("", {
					files: [{
						attachment: stream,
						name: "triggered.gif"
					}]
				});
			})
				.catch(err => message.channel.send("⚠ " + err));
		}
	}
];