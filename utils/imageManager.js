const Jimp = require("jimp");

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