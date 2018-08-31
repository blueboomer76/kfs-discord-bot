const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class SlotsCommand extends Command {
	constructor() {
		super({
			name: "slots",
			description: "Play slots and try to get lucky!",
			aliases: ["slot"],
			guildOnly: true
		});
	}
	
	async run(bot, message, args, flags) {
		let symbols = ["🍒", "💵", "💰", "💎", "🍊", "🍋", "🍐", "🍉", "🍇", ":seven:"];
		let chosen = [];
		for (let i = 0; i < 9; i++) {
			chosen.push(symbols[Math.floor(Math.random() * symbols.length)])
		}
		
		let result = "lost...";
		if (chosen[3] == chosen[4] || chosen[3] == chosen[5] || chosen[4] == chosen[5]) {
			result = "matched 2 symbols!"
			if (chosen[3] == chosen[4] && chosen[3] == chosen[5] && chosen[4] == chosen[5]) {
				result = "matched 3 symbols!"
			}
			
		}
		
		message.channel.send(`**🎰 | Kendra Slots**\n` + 
		`------------------\n` +
		`${chosen[0]} : ${chosen[1]} : ${chosen[2]}\n\n` +
		`${chosen[3]} : ${chosen[4]} : ${chosen[5]} **<<<**\n\n` +
		`${chosen[6]} : ${chosen[7]} : ${chosen[8]}\n` +
		`------------------\n` +
		`You rolled the slots... and ${result}`);
	}
}

module.exports = SlotsCommand;