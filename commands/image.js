const Discord = require("discord.js");
const Command = require("../structures/command.js");
const request = require("request");

module.exports = [
	class MemeCommand extends Command {
		constructor() {
			super({
				name: "meme",
				description: "Gets a meme",
				cooldown: {
					time: 15000,
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
			request.get({
				url: `https://reddit.com/r/memes/hot.json`,
				qs: {limit: 100},
				json: true
			}, (err, res) => {
				if (err || res.statusCode >= 400) return message.channel.send(`Failed to retrieve from Reddit. (status code ${res.statusCode})`)
				
				let results = res.body.data.children,
					postData = results[Math.floor(Math.random() * results.length)].data,
					imgResolutions = postData.preview.images[0].resolutions,
					img = imgResolutions.find(r => r.width == 960) ||
						imgResolutions.find(r => r.width == 640) ||
						imgResolutions.find(r => r.width == 320);
				
				message.channel.send(new Discord.RichEmbed()
				.setTitle(`${postData.title.replace(/&amp;/g, "&")}`)
				.setURL(`https://redd.it/${postData.id}`)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter(`👍 ${postData.score} | 💬 ${postData.num_comments} | u/${postData.author}`)
				.setImage(img.url.replace(/&amp;/g, "&"))
				)
			})
		}
	}
]