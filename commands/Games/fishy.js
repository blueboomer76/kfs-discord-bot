const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class FishyCommand extends Command {
	constructor() {
		super({
			name: "fishy",
			description: "Catch fish and other objects with a fishing pole!",
			aliases: ["fish"],
			guildOnly: true
		});
	}
	
	async run(bot, message, args, flags) {
		let commonObjs = ["🔋", "🛒", "👞", "📎"];
		let uncommonObjs = ["🐠", "🐡", "🐢", "🦐"];
		let rareObjs = ["🦑", "🐙", "🐸"];
		
		let rand = Math.random(), fished;
		if (rand < 0.45) {
			fished = commonObjs[Math.floor(Math.random() * commonObjs.length)]
		} else if (rand < 0.75) {
			fished = "🐟"
		} else if (rand < 0.95) {
			fished = uncommonObjs[Math.floor(Math.random() * uncommonObjs.length)]
		} else {
			fished = rareObjs[Math.floor(Math.random() * rareObjs.length)]
		}
		
		message.channel.send(`🎣 You used a fishing pole and caught: ${fished}!`);
	}
}

module.exports = FishyCommand;