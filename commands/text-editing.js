const Command = require("../structures/command.js");

const grouperRegex = /<(a?:[0-9A-Za-z_]{2,}:|@!?|@&|#)\d+>|[\u0080-\uFFFF]{2}|./g,
	wordGrouperRegex = /<(a?:[0-9A-Za-z_]{2,}:|@!?|@&|#)\d+>|([\u0080-\uFFFF]{2})+|\S+/g;

module.exports = [
	class ClapifyCommand extends Command {
		constructor() {
			super({
				name: "clapify",
				description: "Clapify 👏 text 👏 for 👏 you",
				aliases: ["clap"],
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				usage: "clapify <text>"
			});
		}

		async run(bot, message, args, flags) {
			let toClapify = args[0].split(" ");
			if (toClapify.length == 1) toClapify = args[0].split("");

			const clapified = toClapify.join(" 👏 ");
			if (clapified.length >= 2000) return {cmdWarn: "Your input text to clapify is too long!"};
			message.channel.send(clapified);
		}
	},
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

			message.channel.send("```" + cowsayLines.join("\n") + "```");
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
						case " ": emojified += "   "; break;
						case "0": emojified += ":zero: "; break;
						case "1": emojified += ":one: "; break;
						case "2": emojified += ":two: "; break;
						case "3": emojified += ":three: "; break;
						case "4": emojified += ":four: "; break;
						case "5": emojified += ":five: "; break;
						case "6": emojified += ":six: "; break;
						case "7": emojified += ":seven: "; break;
						case "8": emojified += ":eight: "; break;
						case "9": emojified += ":nine: "; break;
						default: emojified += c + " ";
					}
				}
			}

			message.channel.send(emojified);
		}
	},
	class OwoifyCommand extends Command {
		constructor() {
			super({
				name: "owoify",
				description: "Transforms your text into owo form :3",
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				usage: "owoify <text>"
			});
		}

		async run(bot, message, args, flags) {
			if (args[0].length > 1000) return {cmdWarn: "That text is too long, must be under 1000 characters."};

			const owoifySuffixes = ["owo", "OWO", "uwu", "UwU", "X3", ":3", "***notices bulge** OwO, what's this?*"],
				owoified = args[0].toLowerCase()
					.replace(/[lr]+/g, "w")
					.replace(/n/g, "ny")
					.split(" ")
					.map(word => Math.random() < 0.25 ? `${word.charAt(0)}-${word}` : word)
					.join(" ");
			message.channel.send(owoified + " " + owoifySuffixes[Math.floor(Math.random() * owoifySuffixes.length)]);
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
				flags: [
					{
						name: "words",
						desc: "Reverse text by words"
					}
				],
				usage: "reverse <text> [--words]"
			});
		}

		async run(bot, message, args, flags) {
			if (args[0].length > 1000) return {cmdWarn: "That text is too long, must be under 1000 characters."};

			const wordsFlag = flags.some(f => f.name == "words");
			message.channel.send(args[0].match(wordsFlag ? wordGrouperRegex : grouperRegex).reverse().join(wordsFlag ? " " : ""));
		}
	},
	class ScrambleCommand extends Command {
		constructor() {
			super({
				name: "scramble",
				description: "Scrambles up the letters or words of your text",
				aliases: ["jumble"],
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				flags: [
					{
						name: "inner",
						desc: "Scramble surrounding letters"
					},
					{
						name: "words",
						desc: "Scramble text using words"
					}
				],
				usage: "scramble <text> [--(inner|words)]"
			});
		}

		async run(bot, message, args, flags) {
			if (args[0].length > 1000) return {cmdWarn: "That text is too long, must be under 1000 characters."};

			const innerFlag = flags.some(f => f.name == "inner"),
				wordsFlag = flags.some(f => f.name == "words"),
				toScramble = args[0].match(wordsFlag ? wordGrouperRegex : grouperRegex);
			let scrambled;
			if (innerFlag) {
				scrambled = toScramble;
				const max1 = Math.floor(scrambled.length / 2) * 2, max2 = Math.floor((scrambled.length - 1) / 2) * 2 + 1;
				for (let i = 0; i < 4; i++) {
					const offset = i % 2, max = offset == 0 ? max1 : max2;
					for (let j = 0; j < max; j += 2) {
						if (Math.random() > 0.5) {
							const temp = scrambled[offset+j];
							scrambled[offset+j] = scrambled[offset+j+1];
							scrambled[offset+j+1] = temp;
						}
					}
				}
			} else {
				scrambled = [];
				while (toScramble.length > 0) {
					scrambled.push(toScramble.splice(Math.floor(Math.random() * toScramble.length), 1));
				}
			}
			message.channel.send(scrambled.join(wordsFlag ? " " : ""));
		}
	}
];
