const Command = require("../structures/command.js");

module.exports = [
	class CowsayCommand extends Command {
		constructor() {
			super({
				name: "cowsay",
				description: "Generates cowsay text",
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				usage: "cowsay <text>"
			});
		}
		
		async run(bot, message, args, flags) {
			if (args[0].length > 1000) return {cmdWarn: "That text is too long, must be under 1000 characters.", cooldown: null, noLog: true}
			
			let cowsayLines = [
					"      \\   ^__^",
					"       \\  (oo)\\_______",
					"          (__)\\       )\\/\\",
					"             ||----w |",
					"             ||     ||"
				]
			
			if (args[0].length <= 50) {
				cowsayLines.unshift(` ${("_").repeat(args[0].length + 2)}`,
				`< ${args[0]} >`,
				` ${("-").repeat(args[0].length + 2)}`
				)
			} else {
				let lines = [],
					words = args[0].split(" "),
					currLine = [],
					currWidth = 0,
					nextWidth = 0;
				
				for (let i = 0; i < words.length; i++) {
					nextWidth += words[i].length;
					if (i != 0) nextWidth++;
					if (words[i].length > 50) {
						words.splice(i+1, 0, words[i].slice(50));
						words[i] = words[i].slice(0,50);
					}
					if (nextWidth > 50) {
						lines.push(currLine.join(" "));
						currLine = [words[i]];
						nextWidth = words[i].length;
					} else {
						currLine.push(words[i]);
					}
					currWidth = nextWidth;
					if (i == words.length - 1) lines.push(currLine.join(" "));
				}

				for (let i = 0; i < lines.length; i++) {
					lines[i] = lines[i].padEnd(50, " ")
				}
								
				let toDisplayLines = [];
				toDisplayLines.push(` ${("_").repeat(52)}`, `/ ${lines[0]} \\`)
				if (lines.length > 2) {
					for (let i = 1; i < lines.length - 1; i++) {
						toDisplayLines.push(`| ${lines[i]} |`)
					}
				}
				toDisplayLines.push(`\\ ${lines[lines.length - 1]} /`, ` ${("-").repeat(52)}`)
				cowsayLines = toDisplayLines.concat(cowsayLines)
			}
			
			message.channel.send(`\`\`\`${cowsayLines.join("\n")}\`\`\``)
		}
	},
	class EmojifyCommand extends Command {
		constructor() {
			super({
				name: "emojify",
				description: "Turns text into emojis",
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				usage: "emojify <text>"
			});
		}
		
		async run(bot, message, args, flags) {
			if (args[0].length > 85) return {cmdWarn: "That text is too long, must be under 85 characters.", cooldown: null, noLog: true};
			
			let chars = args[0].toLowerCase().split(""), emojified = "", emojiRegex = /[a-z]/;
			for (const c of chars) {
				if (emojiRegex.test(c)) {
					emojified += `:regional_indicator_${c}: `
				} else {
					switch (c) {
						case " ":
							emojified += "   ";
							break;
						case "0":
							emojified += ":zero: ";
							break;
						case "1":
							emojified += ":one: ";
							break;
						case "2":
							emojified += ":two: ";
							break;
						case "3":
							emojified += ":three: ";
							break;
						case "4":
							emojified += ":four: ";
							break;
						case "5":
							emojified += ":five: ";
							break;
						case "6":
							emojified += ":six: ";
							break;
						case "7":
							emojified += ":seven: ";
							break;
						case "8":
							emojified += ":eight: ";
							break;
						case "9":
							emojified += ":nine: ";
							break;
						default:
							emojified += `${c} `;
					}
				}
			}
		
			message.channel.send(emojified);
		}
	},
	class ReverseCommand extends Command {
		constructor() {
			super({
				name: "reverse",
				description: "Reverses text",
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				usage: "reverse <text>"
			});
		}
		
		async run(bot, message, args, flags) {
			if (args[0].length > 1000) return {cmdWarn: "That text is too long, must be under 1000 characters.", cooldown: null, noLog: true}
			let chars = args[0].split(""), reversed = "";
			for (let i = chars.length - 1; i > -1; i--) reversed += chars[i];
			message.channel.send(reversed);
		}
	}
]