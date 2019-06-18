const {applyJimpFilter} = require("../modules/filters.js"),
	Jimp = require("jimp"),
	request = require("request"),
	svg2png = require("svg2png");

module.exports = {
	getImageResolvable: async (message, userInput) => {
		let resolvedContent = null;
		if (userInput && userInput.isEmoji) {
			await svg2png(userInput.content, {width: 512, height: 512})
				.then(pngBuffer => resolvedContent = Buffer.from(pngBuffer))
				.catch(err => {
					console.error("SVG to PNG conversion failed:");
					console.error(err);
				});
		} else if (!userInput) {
			await message.channel.fetchMessages({limit: 25})
				.then(msgs => {
					msgs = msgs.array();
					for (const msg of msgs) {
						if (msg.attachments.size > 0) {
							resolvedContent = msg.attachments.last().url;
							break;
						} else {
							const lastEmbed = msg.embeds[msg.embeds.length - 1];
							if (lastEmbed && lastEmbed.image) {
								resolvedContent = lastEmbed.image.url;
								break;
							} else if (lastEmbed && lastEmbed.type == "image") {
								resolvedContent = lastEmbed.url;
								break;
							}
						}
					}
				})
				.catch(err => console.error("Failed to fetch messages while resolving an image URL: " + err));
		} else {
			resolvedContent = userInput;
		}
		return resolvedContent;
	},
	getCanvasImage: (img, imgResolvable, isEmoji) => {
		if (isEmoji) {
			img.src = imgResolvable;
		} else {
			img.onerror = err => {
				console.error("Failed to load a canvas image: ");
				console.error(err);
			};
			request.get({
				url: imgResolvable,
				encoding: null
			}, (err, res) => {
				if (err || !res || res.statusCode >= 400) {
					console.log("Failed to get source data for a canvas image.");
				} else {
					img.src = res.body;
				}
			});
		}
	},
	applyJimpFilterAndPost: (msg, imgResolvable, filter, options = {}) => {
		Jimp.read(imgResolvable)
			.then(img => {
				applyJimpFilter(img, filter, options);
				img.getBufferAsync(Jimp.MIME_PNG)
					.then(imgToSend => {
						msg.channel.send({
							files: [{attachment: imgToSend, name: filter + ".png"}]
						});
					})
					.catch(() => {
						msg.channel.send("Failed to generate the image.");
					});
			})
			.catch(() => {
				msg.channel.send("⚠ Failed to get image for that URL.");
			});	
	},
	postJimpImage: (msg, img, fileName) => {
		img.getBufferAsync(Jimp.MIME_PNG)
			.then(imgToSend => {
				msg.channel.send({
					files: [{
						attachment: imgToSend,
						name: fileName
					}]
				});
			})
			.catch(() => {
				msg.channel.send("Failed to generate the image.");
			});
	}
};
