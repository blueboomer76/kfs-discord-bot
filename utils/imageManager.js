const Jimp = require("jimp");

module.exports = {
	resolveImageURL: message => {
		return new Promise(async (resolve, reject) => {
			await message.channel.fetchMessages({limit: 25})
			.then(msgs => {
				msgs = msgs.array();
				let imageURL;
				for (const msg of msgs) {
					if (msg.attachments.size > 0) {
						imageURL = msg.attachments.last().url;
						break;
					} else {
						let lastEmbed = msg.embeds[msg.embeds.length - 1];
						if (lastEmbed && lastEmbed.image) {
							imageURL = lastEmbed.image.url;
							break;
						} else if (lastEmbed && lastEmbed.type == "image") {
							imageURL = lastEmbed.url;
							break;
						}
					}
				}
				if (imageURL) {
					resolve(imageURL);
				} else {
					reject("No image attachment found in recent messages.")
				}
			})
			.catch(err => reject("Failed while trying to fetch messages:" + "\n" + err))
		})
	},
	postImage: (msg, img, fileName) => {
		img.getBufferAsync(Jimp.MIME_PNG)
		.then(imgToSend => {
			msg.channel.send({
				files: [{
					attachment: imgToSend,
					name: fileName
				}]
			})
		})
		.catch(() => {
			msg.channel.send("Failed to generate the image.")
		})
	}
}
