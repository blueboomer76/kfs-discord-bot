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
			if (args[0].length > 1000) return {cmdWarn: "That text is too long, must be under 1000 characters."};
			
			const inputText = args[0].replace(/\n/g, " ");
			let cowsayLines = [
				"        \\   ^__^",
				"         \\  (oo)\\_______",
				"            (__)\\       )\\/\\",
				"               ||----w |",
				"               ||     ||"
			];

			if (inputText.length <= 50) {
				cowsayLines.unshift(` ${"_".repeat(inputText.length + 2)}`,
					`< ${inputText} >`,
					` ${"-".repeat(inputText.length + 2)}`
				);
			} else {
				const lines = [];
				let remainText = inputText;
				while (remainText.length > 0) {
					let currLine = remainText.slice(0, 50);
					if (remainText.length > 50) {
						const lastIndex = currLine.lastIndexOf(" ");
						if (lastIndex != -1) {
							currLine = currLine.slice(0, lastIndex);
							remainText = remainText.slice(lastIndex + 1);
						} else {
							remainText = remainText.slice(50);
						}
					} else {
						remainText = "";
					}
					lines.push(currLine);
				}

				for (let i = 0; i < lines.length; i++) {
					lines[i] = lines[i].padEnd(50, " ");
				}
	
				const toDisplayLines = [];
				toDisplayLines.push(` ${"_".repeat(52)}`, `/ ${lines[0]} \\`);
				if (lines.length > 2) {
					for (let i = 1; i < lines.length - 1; i++) {
						toDisplayLines.push(`| ${lines[i]} |`);
					}
				}
				toDisplayLines.push(`\\ ${lines[lines.length - 1]} /`, ` ${"-".repeat(52)}`);
				cowsayLines = toDisplayLines.concat(cowsayLines);
			}
			
			message.channel.send(`\`\`\`${cowsayLines.join("\n")}\`\`\``);
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
			if (args[0].length > 85) return {cmdWarn: "That text is too long, must be under 85 characters."};
			
			const chars = args[0].toLowerCase().split(""), letterRegex = /[a-z]/;
			let emojified = "";
			for (const c of chars) {
				if (letterRegex.test(c)) {
					emojified += `:regional_indicator_${c}: `;
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
			if (args[0].length > 1000) return {cmdWarn: "That text is too long, must be under 1000 characters."};
			const chars = args[0].split("");
			let reversed = "";
			for (let i = chars.length - 1; i >= 0; i--) reversed += chars[i];
			message.channel.send(reversed);
		}
	}
];
