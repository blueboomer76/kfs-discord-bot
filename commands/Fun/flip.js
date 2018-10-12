const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class FlipCommand extends Command {
	constructor() {
		super({
			name: "flip",
			description: "Flip a coin. You can specify a number of coins to flip",
			aliases: ["coin"],
			args: [
				{
					num: 1,
					optional: true,
					type: "number",
					min: 1,
					max: 30
				}
			],
			usage: "flip <1-30>"
		});
	}
	
	async run(bot, message, args, flags) {
		let iters = args[0] ? args[0] : 1;
		if (iters == 1) {
			let res;
			if (Math.random() < 0.5) {res = "Heads"} else {res = "Tails"}
			message.channel.send(`I flipped a coin and got ${res}`)
		} else {
			let res = [], heads = 0;
			for (let i = 0; i < iters; i++) {
				if (Math.random() < 0.5) {res.push("Heads"); heads++} else {res.push("Tails")}
			}
			message.channel.send(`I flipped ${iters} coins and got: ${res.join(", ")}` +
			`\n(${heads} heads and ${iters-heads} tails)`)
		}
	}
}

module.exports = FlipCommand;