const Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	imageManager = require("../../utils/imageManager.js");

const subcommands = [
	class DeepFrySubcommand extends Command {
		constructor() {
			super({
				name: "deepfry",
				description: "Deep fries an image",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
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

			imageManager.applyJimpFilterAndPost(ctx, fetchedImg.data, "deepfry", {jpeg: true});
		}
	},
	class FlipSubcommand extends Command {
		constructor() {
			super({
				name: "flip",
				description: "Flip an image vertically",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
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

			imageManager.applyJimpFilterAndPost(ctx, fetchedImg.data, "flip");
		}
	},
	class FlopSubcommand extends Command {
		constructor() {
			super({
				name: "flop",
				description: "Flop an image horizontally",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
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

			imageManager.applyJimpFilterAndPost(ctx, fetchedImg.data, "flop");
		}
	},
	class GrayscaleSubcommand extends Command {
		constructor() {
			super({
				name: "grayscale",
				description: "Make an image gray",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
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

			imageManager.applyJimpFilterAndPost(ctx, fetchedImg.data, "grayscale");
		}
	},
	class InvertSubcommand extends Command {
		constructor() {
			super({
				name: "invert",
				description: "Invert the colors of an image",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
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

			imageManager.applyJimpFilterAndPost(ctx, fetchedImg.data, "invert");
		}
	},
	class NeedsMoreJPEGSubcommand extends Command {
		constructor() {
			super({
				name: "needsmorejpeg",
				description: "Add more JPEG to an image",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
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

			imageManager.applyJimpFilterAndPost(ctx, fetchedImg.data, "needsmorejpeg", {jpeg: true});
		}
	},
	class RainbowifySubcommand extends Command {
		constructor() {
			super({
				name: "rainbowify",
				description: "Makes a rainbow image of an existing image",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
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

			imageManager.applyJimpFilterAndPost(ctx, fetchedImg.data, "rainbowify");
		}
	},
	class RandomCropSubcommand extends Command {
		constructor() {
			super({
				name: "randomcrop",
				description: "Crops an image randomly",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
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

			imageManager.applyJimpFilterAndPost(ctx, fetchedImg.data, "randomcrop");
		}
	},
	class SepiaSubcommand extends Command {
		constructor() {
			super({
				name: "sepia",
				description: "Apply a sepia filter to an image",
				args: [
					{
						name: "image",
						description: "Image URL, emoji, or mention",
						type: "string",
						parsedType: "image",
						required: true
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

			imageManager.applyJimpFilterAndPost(ctx, fetchedImg.data, "sepia");
		}
	}
];

class ImageCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "image",
			description: "Image manipulation",
			subcommands: subcommands
		});
	}
}

module.exports = ImageCommandGroup;
