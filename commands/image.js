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
					postData = results[Math.floor(Math.random() * results.length)].data;
				
				message.channel.send(new Discord.RichEmbed()
				.setTitle(`${postData.title}`)
				.setURL(`https://reddit.com${postData.permalink}`)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter(`👍 ${postData.score} | 💬 ${postData.num_comments} | u/${postData.author}`)
				.setImage(postData.preview.images[0].resolutions.find(r => r.width == 640 || r.width == 320).url.replace(/&amp;/g, "&"))
				)
			})
		}
	}
]