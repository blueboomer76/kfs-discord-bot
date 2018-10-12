const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const request = require("request");
const cheerio = require("cheerio");

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
			},
			startTyping: true
		});
	}
	
	async run(bot, message, args, flags) {
		request.get("https://reddit.com/r/memes", (err, res) => {
			if (err || res.statusCode >= 400) return message.channel.send(`Failed to retrieve from Reddit. (status code ${res.statusCode})`)
			const $ = cheerio.load(res.body);
			
			let postElements = $(".Post:not(:has(span:contains('promoted')))");
			
			let titleArray = postElements.map((i, e) => {
					return $(e).find("h2").text()
				}).toArray(),
				authorArray = postElements.map((i, e) => {
					return $(e).find("a[href^='/user/']").text()
				}).toArray(),
				linkArray = postElements.map((i, e) => {
					return $(e).find("[data-click-id='body']").attr("href")
				}).toArray(),
				imageArray = postElements.map((i, e) => {
					return $(e).find("[data-click-id='media'] img").attr("src")
				}).toArray(),
				voteArray = postElements.map((i, e) => {
					return $(e).find("[data-click-id='upvote']").next().html()
				}).toArray(),
				commentArray = postElements.map((i, e) => {
					return $(e).find("[data-click-id='comments'] span").text().replace(/ comments?/, "")
				}).toArray();
			
			let rand = Math.floor(Math.random() * titleArray.length);
			message.channel.send(new Discord.RichEmbed()
			.setTitle(`${titleArray[rand]}`)
			.setURL(`https://reddit.com${linkArray[rand]}`)
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter(`👍 ${voteArray[rand]} | 💬 ${commentArray[rand]} | ${authorArray[rand]}`)
			.setImage(imageArray[rand])
			)
		})
	}
}

module.exports = MemeCommand;