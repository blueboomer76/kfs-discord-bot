const Jimp = require("jimp");

module.exports = {
	resolveImageURL: async message => {
		let imageURL = null;
		await message.channel.fetchMessages({limit: 25})
			.then(msgs => {
				msgs = msgs.array();
				for (const msg of msgs) {
					if (msg.attachments.size > 0) {
						imageURL = msg.attachments.last().url;
						break;
					} else {
						const lastEmbed = msg.embeds[msg.embeds.length - 1];
						if (lastEmbed && lastEmbed.image) {
							imageURL = lastEmbed.image.url;
							break;
						} else if (lastEmbed && lastEmbed.type == "image") {
							imageURL = lastEmbed.url;
							break;
						}
					}
				}
			})
			.catch(err => console.log("Failed to fetch messages while resolving an image URL:", err));
		return imageURL;
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
