const {applyJimpFilter} = require("../modules/filters.js"),
	Jimp = require("jimp"),
	request = require("request"),
	svg2png = require("svg2png");

function getEmojiImage(url) {
	return new Promise((resolve, reject) => {
		request.get({
			url: url,
			encoding: null
		}, (err, res) => {
			if (err) reject("Failed to fetch emoji: " + err.message);
			if (res.statusCode >= 400) reject("Failed to fetch emoji: " + res.statusMessage);

			svg2png(res.body, {width: 512, height: 512})
				.then(pngBuffer => resolve(Buffer.from(pngBuffer)))
				.catch(err => reject("SVG to PNG conversion failed: " + err));
		});
	});
}

module.exports = {
	getImageResolvable: async (message, userInput) => {
		const result = {data: null, error: null};
		if (userInput && userInput.isEmoji) {
			// User input is an emoji
			await getEmojiImage(userInput.content)
				.then(data => result.data = data)
				.catch(err => result.error = err);
		} else if (!userInput) {
			// No user input given, search through messages
			await message.channel.fetchMessages({limit: 25})
				.then(msgs => {
					for (const msg of msgs.values()) {
						if (msg.attachments.size > 0) {
							result.data = msg.attachments.last().url;
							break;
						} else {
							const lastEmbed = msg.embeds[msg.embeds.length - 1];
							if (lastEmbed && lastEmbed.image) {
								result.data = lastEmbed.image.url;
								break;
							} else if (lastEmbed && lastEmbed.type == "image") {
								result.data = lastEmbed.url;
								break;
							}
						}
					}
					if (!result.data) result.error = "No mention or emoji found, or image attachment found in recent messages";
				})
				.catch(err => result.error = "Failed to fetch messages while finding images: " + err);
		} else {
			// User input given as string (maybe through member mention or actual URL)
			result.data = userInput;
		}
		return result;
	},
	getCanvasImage: (canvasImg, imgResolvable, isEmoji, callback) => new Promise((resolve, reject) => {
		if (isEmoji) {
			canvasImg.src = imgResolvable;
			callback();
			resolve();
		} else {
			canvasImg.onload = callback;
			canvasImg.onerror = () => reject("Failed to load image onto canvas.");
			request.get({
				url: imgResolvable,
				encoding: null
			}, (err, res) => {
				if (err || !res || res.statusCode >= 400) {
					reject("Failed to get source data for the image.");
				} else {
					canvasImg.src = res.body;
				}
			});
		}
	}),
	applyJimpFilterAndPost: (msg, imgResolvable, filter, options = {}) => {
		Jimp.read(imgResolvable)
			.then(img => {
				applyJimpFilter(img, filter, options);
				img.getBufferAsync(options.jpeg ? Jimp.MIME_JPEG : Jimp.MIME_PNG)
					.then(imgToSend => {
						msg.channel.send({
							files: [{attachment: imgToSend, name: filter + (options.jpeg ? ".jpg" : ".png")}]
						});
					})
					.catch(() => msg.channel.send("⚠ Failed to generate the image."));
			})
			.catch(() => msg.channel.send("⚠ Failed to read image contents."));
	},
	postJimpImage: (msg, img, fileName) => {
		img.getBufferAsync(Jimp.MIME_PNG)
			.then(imgToSend => {
				msg.channel.send({
					files: [{attachment: imgToSend, name: fileName}]
				});
			})
			.catch(() => msg.channel.send("⚠ Failed to generate the image."));
	}
};
