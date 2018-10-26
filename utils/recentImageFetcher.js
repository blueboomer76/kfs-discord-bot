module.exports.getRecentImage = message => {
	return new Promise(async (resolve, reject) => {
		await message.channel.fetchMessages({limit: 50})
		.then(msgs => {
			let imgObjs = msgs.filter(msg => {
					return (msg.embeds[0] && msg.embeds[0].image != undefined) || msg.attachments.size != 0
				}).map(msg => {
					return {
						embeds: msg.embeds[0],
						attachments: msg.attachments
					}
				}),
				imageURL;
			for (const obj of imgObjs) {
				if (obj.embeds && obj.embeds.image) {
					imageURL = obj.embeds.image.url;
					break;
				} else if (obj.attachments.size > 0) {
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
		.catch(err => reject("Failed while tried to fetch messages."))
	})
}