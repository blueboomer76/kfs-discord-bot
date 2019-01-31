const Jimp = require("jimp"),
	request = require("request");

module.exports = {
	resolveImageUrl: async message => {
		let imageURL = null;
		await message.channel.fetchMessages({limit: 25})
			.then(msgs => {
				msgs = msgs.array();
				for (const msg of msgs) {
					if (msg.embeds[0] && msg.embeds[0].type == "image") {
						imageURL = msg.embeds[0].url;
						break;
					} else if (msg.embeds[0] && msg.embeds[0].image) {
						imageURL = msg.embeds[0].image.url;
						break;
					} else if (msg.attachments.size != 0) {
						imageURL = msg.attachments.last().url;
						break;
					}
				}
			})
			.catch(err => console.log("Failed to fetch messages while resolving an image URL:", err));
		return imageURL;
	},
	getCanvasImage: (img, url) => {
		img.onerror = () => {
			console.log("Failed to load the image.");
		};
		request.get({
			url: url,
			encoding: null
		}, (err, res) => {
			if (err || res.statusCode >= 400) {
				console.log("Failed to get URL while trying to assign the source to the canvas image.");
			} else {
				img.src = res.body;
			}
		});
	},
	postImage: (msg, img, fileName) => {
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