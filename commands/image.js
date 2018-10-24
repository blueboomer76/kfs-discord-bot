const Discord = require("discord.js");
const Command = require("../structures/command.js");
const Jimp = require("jimp");
const request = require("request");

module.exports = [
	class InvertCommand extends Command {
		constructor() {
			super({
				name: "invert",
				description: "Invert the colors of an image",
				args: [
					{
						num: 1,
						type: "image"
					}
				],
				cooldown: {
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["ATTACH_FILES"],
					user: [],
					level: 0
				},
				usage: "invert <image URL>"
			});
		}
		
		async run(bot, message, args, flags) {
			Jimp.read(args[0])
			.then(img => {
				img.invert().getBufferAsync(Jimp.MIME_PNG)
				.then(imgToSend => {
					message.channel.send({
						files: [{
							attachment: imgToSend,
							name: "invert.png"
						}]
					})
				})
				.catch(err => {
					message.channel.send("Failed to generate the image.")
				})
			})
			.catch(err => {
				message.channel.send("Failed to get image for that URL.")
			})
		}
	},
	class MemeCommand extends Command {
		constructor() {
			super({
				name: "meme",
				description: "Gets a meme",
				cooldown: {
					time: 20000,
					type: "channel"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}

		async run(bot, message, args, flags) {
			request.get("https://reddit.com/r/memes/hot.json", (err, res) => {
				if (err) return message.channel.send(`Could not request to Reddit: ${err.message}`);
				if (!res) return message.channel.send("No response was received from Reddit.");
				if (res.statusCode >= 400) return message.channel.send(`The request to Reddit failed with status code ${res.statusCode} (${res.statusMessage})`);

				let results = JSON.parse(res.body).data.children,
					postData = results[Math.floor(Math.random() * results.length)].data;
				let title = postData.title.replace(/&amp;/g, "&"),
					imageURL;
				if (postData.preview) {
					postData.preview.images[0].resolutions.forEach(rInfo => {
						if (rInfo.width <= 960) imageURL = rInfo.url;
					})
					if (!imageURL) imageURL = postData.preview.images[0].resolutions[0].url;
					imageURL = imageURL.replace(/&amp;/g, "&");
				} else {
					imageURL = postData.url;
				}

				message.channel.send(new Discord.RichEmbed()
				.setTitle(title.length > 250 ? `${title.slice(0, 250)}...` : title)
				.setURL(`https://reddit.com${postData.permalink}`)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter(`👍 ${postData.score} | 💬 ${postData.num_comments} | u/${postData.author}`)
				.setImage(imageURL)
				);
			})
		}
	}
]
