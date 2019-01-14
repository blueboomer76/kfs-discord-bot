const Jimp = require("jimp");

module.exports = {
	resolveImageUrl: message => {
		return new Promise(async (resolve, reject) => {
			await message.channel.fetchMessages({limit: 25})
			.then(msgs => {
				let imgObjs = msgs.filter(msg => {
						return (msg.embeds[0] && (msg.embeds[0].type == "image" || msg.embeds[0].image != null)) ||
							msg.attachments.size != 0
					}).map(msg => {
						return {
							embeds: msg.embeds[0],
							attachments: msg.attachments
						}
					}),
					imageURL;
				for (const obj of imgObjs) {
					if (obj.embeds && obj.embeds.type == "image") {
						imageURL = obj.embeds.url;
						break;
					} else if (obj.embeds && obj.embeds.image) {
						imageURL = obj.embeds.image.url;
						break;
					} else if (obj.attachments.size != 0) {
						imageURL = obj.attachments.last().url
						break;
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