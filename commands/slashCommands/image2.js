const Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	imageManager = require("../../utils/imageManager.js"),
	Canvas = require("canvas"),
	gifencoder = require("gifencoder"),
	Jimp = require("jimp");

Canvas.registerFont("assets/Oswald-Regular.ttf", {family: "Oswald"});

const subcommands = [
	class BlurSubcommand extends Command {
		constructor() {
			super({
				name: "blur",
				description: "Blur an image",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
					},
					{
						name: "level",
						description: "The level to blur the image (>= 1)",
						type: "integer",
						min: 1
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
				}
			});
		}

		async run(ctx) {
			const fetchedImg = await imageManager.getImageResolvable(ctx, ctx.parsedArgs["image"]);
			if (fetchedImg.error) return ctx.respond(fetchedImg.error, {level: "warning"});

			imageManager.applyJimpFilterAndPost(ctx, fetchedImg.data, "blur", {blur: ctx.parsedArgs["level"] || null});
		}
	},
	class ColorifySubcommand extends Command {
		constructor() {
			super({
				name: "colorify",
				description: "Changes the colors of an image to a certain hue",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
					},
					{
						name: "color",
						description: "Color to apply",
						type: "string",
						parsedType: "color",
						required: true
					},
					{
						name: "intensity",
						description: "Set the intensity of the new color",
						type: "integer",
						choices: [
							{name: "1", value: 1},
							{name: "2", value: 2},
							{name: "3", value: 3},
							{name: "4", value: 4},
							{name: "5", value: 5},
							{name: "6", value: 6},
							{name: "7", value: 7},
							{name: "8", value: 8},
							{name: "9", value: 9},
							{name: "10", value: 10}
						]
					}
				],
				cooldown: {
					name: "image-editing",
					time: 15000,
					type: "channel"
				}
			});
		}

		async run(ctx) {
			const fetchedImg = await imageManager.getImageResolvable(ctx, ctx.parsedArgs["image"]);
			if (fetchedImg.error) return ctx.respond(fetchedImg.error, {level: "warning"});

			const colorFlag = ctx.parsedArgs["color"];
			imageManager.applyJimpFilterAndPost(ctx, fetchedImg.data, "colorify", {
				colors: [Math.floor(colorFlag / 65536), Math.floor((colorFlag % 65536) / 256), colorFlag % 256],
				intensity: ctx.parsedArgs["intensity"] || 5
			});
		}
	},
	class CompositeSubcommand extends Command {
		constructor() {
			super({
				name: "composite",
				description: "Composites two or more images into one (max. 10 images/emojis)",
				args: [
					{
						name: "image1",
						description: "1st image",
						type: "string",
						parsedType: "image",
						required: true
					},
					{
						name: "image2",
						description: "2nd image",
						type: "string",
						parsedType: "image",
						required: true
					},
					{
						name: "image3",
						description: "3rd image",
						type: "string",
						parsedType: "image"
					},
					{
						name: "image4",
						description: "4th image",
						type: "string",
						parsedType: "image"
					},
					{
						name: "image5",
						description: "5th image",
						type: "string",
						parsedType: "image"
					},
					{
						name: "image6",
						description: "6th image",
						type: "string",
						parsedType: "image"
					},
					{
						name: "image7",
						description: "7th image",
						type: "string",
						parsedType: "image"
					},
					{
						name: "image8",
						description: "8th image",
						type: "string",
						parsedType: "image"
					},
					{
						name: "image9",
						description: "9th image",
						type: "string",
						parsedType: "image"
					},
					{
						name: "image10",
						description: "10th image",
						type: "string",
						parsedType: "image"
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
				}
			});
		}

		async run(ctx) {
			const rawImages = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
				.map(num => ctx.parsedArgs["image" + num])
				.filter(rimg => rimg != undefined);

			const errs = [], imgs = [];
			for (let i = 0; i < rawImages.length; i++) {
				const arg = rawImages[i],
					fetchedImg = await imageManager.getImageResolvable(ctx, arg);
				if (fetchedImg.error) {
					errs.push("Image " + i + ": " + fetchedImg.error);
				} else {
					await Jimp.read(fetchedImg.data)
						.then(img => imgs.push(img))
						.catch(() => errs.push("Image " + i + ": Failed to read image contents."));
				}

				if (errs.length >= rawImages.length - 1) {
					return {cmdWarn: "Not enough images loaded successfully to produce a composite image.\n" +
						"```" + errs.join("\n") + "```"};
				}
			}

			const compositeImg = imgs.shift(),
				compositeWidth = compositeImg.bitmap.width,
				compositeHeight = compositeImg.bitmap.height;
			for (const img of imgs) {
				const widthRatio = compositeWidth / img.bitmap.width, newHeight = img.bitmap.height * widthRatio;
				if (newHeight > compositeHeight) {
					img.scale(widthRatio);
					const yOffset = Math.floor((newHeight - compositeHeight) / 2);
					img.crop(0, yOffset, img.bitmap.width, newHeight - yOffset);
				} else if (newHeight < compositeHeight) {
					const heightRatio = compositeHeight / img.bitmap.height, newWidth = img.bitmap.width * heightRatio;
					img.scale(heightRatio);
					const xOffset = Math.floor((newWidth - compositeWidth) / 2);
					img.crop(xOffset, 0, newWidth - xOffset, img.bitmap.height);
				}

				compositeImg.composite(img, 0, 0, {opacitySource: 0.5});
			}

			imageManager.postJimpImage(ctx, compositeImg, "composite.png");
		}
	},
	class CreateMemeSubcommand extends Command {
		constructor() {
			super({
				name: "creatememe",
				description: "Makes a custom meme based on an image and some text",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
					},
					{
						name: "text",
						description: "The meme text",
						fullDescription: "The meme text. Use | to separate the top and bottom text",
						type: "string",
						required: true
					},
					{
						name: "disable_caps",
						description: "Allow lowercase letters in the meme",
						type: "boolean"
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
				}
			});
		}

		async run(ctx) {
			const fetchedImg = await imageManager.getImageResolvable(ctx, ctx.parsedArgs["image"]);
			if (fetchedImg.error) return ctx.respond(fetchedImg.error, {level: "warning"});

			const rawImage = ctx.parsedArgs["image"],
				rawMemeText = ctx.parsedArgs["text"];

			const pipeRegex = / ?\| /;
			let topText, bottomText;
			if (pipeRegex.test(rawMemeText)) {
				const memeTexts = rawMemeText.split(pipeRegex, 2);
				topText = memeTexts[0];
				bottomText = memeTexts[1];
			} else {
				const rawTopText = rawMemeText.slice(0, Math.floor(rawMemeText.length / 2)),
					lastSpaceIndex = rawTopText.lastIndexOf(" ");
				if (lastSpaceIndex != -1) {
					topText = rawMemeText.slice(0, lastSpaceIndex);
					bottomText = rawMemeText.slice(lastSpaceIndex + 1);
				} else {
					const rawBottomText = rawMemeText.slice(Math.floor(rawMemeText.length / 2)),
						lastSpaceIndex2 = rawBottomText.indexOf(" ");
					if (lastSpaceIndex2 != -1) {
						topText = rawTopText + rawBottomText.slice(0, lastSpaceIndex2);
						bottomText = rawBottomText.slice(lastSpaceIndex2 + 1);
					} else {
						topText = rawMemeText;
					}
				}
			}
			if (!ctx.parsedArgs["disable-caps"]) {
				topText = topText.toUpperCase();
				if (bottomText) bottomText = bottomText.toUpperCase();
			}

			const img = new Canvas.Image();

			imageManager.getCanvasImage(img, fetchedImg.data, rawImage && rawImage.isEmoji, () => {
				if (img.width < 100 || img.height < 100) return ctx.respond("You need to use an image 100 x 100 or larger.");
				if (img.width * img.height > 8388608) return ctx.respond("The image is too large.");

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

				ctx.respond({
					files: [{
						attachment: canvas.toBuffer(),
						name: "meme.png"
					}]
				});
			})
				.catch(err => ctx.respond(err, {level: "warning"}));
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
	class MirrorSubcommand extends Command {
		constructor() {
			super({
				name: "mirror",
				description: "Mirrors a half of an image to the other side",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
					},
					{
						name: "direction",
						description: "Direction to flip",
						type: "string",
						choices: [
							{name: "Left to Right (haah)", value: "left-to-right"},
							{name: "Bottom to Top (hooh)", value: "bottom-to-top"},
							{name: "Right to Left (waaw)", value: "right-to-left"},
							{name: "Top to Bottom (woow)", value: "top-to-bottom"}
						],
						required: true
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
				}
			});
		}

		async run(ctx) {
			const fetchedImg = await imageManager.getImageResolvable(ctx, ctx.parsedArgs["image"]);
			if (fetchedImg.error) return ctx.respond(fetchedImg.error, {level: "warning"});

			const type = ctx.parsedArgs["direction"];
			Jimp.read(fetchedImg.data)
				.then(img => {
					const imgClone1 = img.clone(),
						imgClone2 = img.clone(),
						imgWidth = img.bitmap.width,
						imgHalfWidth = imgWidth / 2,
						imgHeight = img.bitmap.height,
						imgHalfHeight = imgHeight / 2,
						imgToSend = new Jimp(imgWidth, imgHeight);
					let fileName;

					if (type == "haah" || type == "left-to-right") {
						imgClone1.crop(imgHalfWidth, 0, imgHalfWidth, imgHeight);
						imgClone2.crop(imgHalfWidth, 0, imgHalfWidth, imgHeight)
							.mirror(true, false);

						imgToSend.composite(imgClone1, imgWidth/2, 0)
							.composite(imgClone2, 0, 0);
						fileName = "mirror-haah.png";
					} else if (type == "hooh" || type == "bottom-to-top") {
						imgClone1.crop(0, imgHalfHeight, imgWidth, imgHalfHeight);
						imgClone2.crop(0, imgHalfHeight, imgWidth, imgHalfHeight)
							.mirror(false, true);

						imgToSend.composite(imgClone1, 0, imgHalfHeight)
							.composite(imgClone2, 0, 0);
						fileName = "mirror-hooh.png";
					} else if (type == "waaw" || type == "right-to-left") {
						imgClone1.crop(0, 0, imgHalfWidth, imgHeight);
						imgClone2.crop(0, 0, imgHalfWidth, imgHeight)
							.mirror(true, false);

						imgToSend.composite(imgClone1, 0, 0)
							.composite(imgClone2, imgHalfWidth, 0);
						fileName = "mirror-waaw.png";
					} else {
						imgClone1.crop(0, 0, imgWidth, imgHalfHeight);
						imgClone2.crop(0, 0, imgWidth, imgHalfHeight)
							.mirror(false, true);

						imgToSend.composite(imgClone1, 0, 0)
							.composite(imgClone2, 0, imgHalfHeight);
						fileName = "mirror-woow.png";
					}
					imageManager.postJimpImage(ctx, imgToSend, fileName);
				})
				.catch(() => {
					ctx.respond("Failed to read image contents.", {level: "warning"});
				});
		}
	},
	class PixelateSubcommand extends Command {
		constructor() {
			super({
				name: "pixelate",
				description: "Pixelates an image",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
					},
					{
						name: "pixels",
						description: "The width of each enlarged pixel (>= 1)",
						type: "integer",
						min: 1
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
				}
			});
		}

		async run(ctx) {
			const fetchedImg = await imageManager.getImageResolvable(ctx, ctx.parsedArgs["image"]);
			if (fetchedImg.error) return ctx.respond(fetchedImg.error, {level: "warning"});

			imageManager.applyJimpFilterAndPost(ctx, fetchedImg.data, "pixelate", {pixels: ctx.parsedArgs["pixels"] || null});
		}
	},
	class ResizeSubcommand extends Command {
		constructor() {
			super({
				name: "resize",
				description: "Resizes an image",
				fullDescription: "Resizes an image. Values above 1 will increase the image width and height, " +
					"and those below 1 will decrease them. The scale cannot be exactly 1",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
					},
					{
						name: "scale",
						description: "Scale",
						type: "number",
						min: 0.01,
						max: 10,
						errorMsg: "You need to enter a number to scale from 0.01 to 10, excluding 1.",
						required: true
					},
					{
						name: "scale2",
						description: "Height scale",
						fullDescription: "Height scale. If not given, it will be set to the width scale",
						type: "number",
						min: 0.01,
						max: 10,
						errorMsg: "You need to enter a number to scale from 0.01 to 10, excluding 1."
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
				}
			});
		}

		async run(ctx) {
			const scale = ctx.parsedArgs["scale"],
				scale2 = ctx.parsedArgs["scale2"];
			if (scale2) {
				if (scale == 1 && scale2 == 1) {
					return ctx.respond("The X and Y scales cannot be both 1.", {level: "warning"});
				}
			} else if (scale == 1) {
				return ctx.respond("The scale cannot be 1.", {level: "warning"});
			}

			const fetchedImg = await imageManager.getImageResolvable(ctx, ctx.parsedArgs["image"]);
			if (fetchedImg.error) return ctx.respond(fetchedImg.error, {level: "warning"});

			imageManager.applyJimpFilterAndPost(ctx, fetchedImg.data, "resize", {
				scaleX: scale,
				scaleY: scale2 || scale
			});
		}
	},
	class RotateSubcommand extends Command {
		constructor() {
			super({
				name: "rotate",
				description: "Rotate an image",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
					},
					{
						name: "degrees",
						description: "The amount of rotation to apply to the image (1-359)",
						type: "integer",
						min: 1,
						max: 359,
						required: true
					},
					{
						name: "crop",
						description: "Crops the excess part of the rotated image",
						type: "boolean"
					},
					{
						name: "reverse",
						description: "Inverts the rotation",
						type: "boolean"
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
				}
			});
		}

		async run(ctx) {
			const fetchedImg = await imageManager.getImageResolvable(ctx, ctx.parsedArgs["image"]);
			if (fetchedImg.error) return ctx.respond(fetchedImg.error, {level: "warning"});

			const degreesFlag = ctx.parsedArgs["degrees"],
				reverseFlag = ctx.parsedArgs["reverse"];
			let rotation;
			if (degreesFlag) {
				rotation = reverseFlag ? 360 - degreesFlag : degreesFlag;
			} else {
				rotation = reverseFlag ? 90 : 270;
			}
			imageManager.applyJimpFilterAndPost(ctx, fetchedImg.data, "rotate", {rotation: rotation, crop: !ctx.parsedArgs["crop"]});
		}
	},
	class SpinSubcommand extends Command {
		constructor() {
			super({
				name: "spin",
				description: "Spin someone or something",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
					},
					{
						name: "speed",
						description: "Spin speed",
						type: "integer",
						choices: [
							{name: "Very Slow", value: 1},
							{name: "Slow", value: 2},
							{name: "Normal", value: 3},
							{name: "Fast", value: 4},
							{name: "Very Fast", value: 5}
						]
					},
					{
						name: "reverse",
						description: "Spin in the opposite direction",
						type: "boolean"
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
				}
			});
		}

		async run(ctx) {
			const fetchedImg = await imageManager.getImageResolvable(ctx, ctx.parsedArgs["image"]);
			if (fetchedImg.error) return ctx.respond(fetchedImg.error, {level: "warning"});

			const rawImage = ctx.parsedArgs["image"],
				speedFlag = ctx.parsedArgs["speed"],
				img = new Canvas.Image();

			imageManager.getCanvasImage(img, fetchedImg.data, rawImage && rawImage.isEmoji, () => {
				let canvasDim = img.width < img.height ? img.width : img.height,
					imgScale = 1,
					imgX = 0,
					imgY = 0;
				if (canvasDim < 128) {
					imgScale = 128 / canvasDim;
				} else if (canvasDim > 640) {
					imgScale = 640 / canvasDim;
				}
				const imgWidth = img.width * imgScale, imgHeight = img.height * imgScale;
				canvasDim *= imgScale;
				if (imgWidth > imgHeight) {
					imgX = -Math.floor((imgWidth - canvasDim) / 2);
				} else if (imgHeight > imgWidth) {
					imgY = -Math.floor((imgHeight - canvasDim) / 2);
				}
				const framesPerSecond = speedFlag ? (speedFlag + 1) * 5 : 20;

				const ctx = Canvas.createCanvas(canvasDim, canvasDim).getContext("2d"),
					encoder = new gifencoder(canvasDim, canvasDim),
					stream = encoder.createReadStream();

				encoder.start();
				encoder.setRepeat(0);
				encoder.setDelay(Math.ceil(1000 / framesPerSecond));
				ctx.beginPath();
				ctx.arc(canvasDim / 2, canvasDim / 2, canvasDim / 2, 0, Math.PI * 2);
				ctx.stroke();
				ctx.closePath();
				ctx.clip();

				const rotateFactor = ctx.parsedArgs["reverse"] ? -12 : 12;
				for (let i = 0; i < 24; i++) {
					ctx.translate(imgX + imgWidth / 2, imgY + imgHeight / 2);
					ctx.rotate(Math.PI / rotateFactor);
					ctx.translate(-(imgX + imgWidth / 2), -(imgY + imgHeight / 2));
					ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
					encoder.addFrame(ctx);
					ctx.fillRect(0, 0, canvasDim, canvasDim);
				}
				encoder.finish();

				ctx.respond({
					files: [{
						attachment: stream,
						name: "spin.gif"
					}]
				});
			})
				.catch(err => ctx.respond(err, {level: "warning"}));
		}
	}
];

class Image2CommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "image2",
			description: "Advanced image manipulation commands",
			subcommands: subcommands
		});
	}
}

module.exports = Image2CommandGroup;
