const Command = require("../structures/command.js");

const grouperRegex = /<(a?:[0-9A-Za-z_]{2,}:|@!?|@&|#)\d+>|[\u0080-\uFFFF]{2}|./g,
	wordGrouperRegex = /<(a?:[0-9A-Za-z_]{2,}:|@!?|@&|#)\d+>|([\u0080-\uFFFF]{2})+|\S+/g;

module.exports = [
	class AltCapsCommand extends Command {
		constructor() {
			super({
				name: "altcaps",
				description: "TuRnS YoUr tExT In AlTeRnAtInG TeXt",
				aliases: ["alternatecap", "alternatecaps", "altcap"],
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				usage: "altcaps <text>"
			});
		}

		async run(bot, message, args, flags) {
			if (args[0].length > 1000) return {cmdWarn: "That text is too long, must be under 1000 characters."};

			const toAltCaps = args[0].split("");
			let altCapResult = "";
			for (let i = 0; i < toAltCaps.length; i++) {
				altCapResult += i % 2 == 0 ? toAltCaps[i].toUpperCase() : toAltCaps[i].toLowerCase();
			}

			message.channel.send(altCapResult);
		}
	},
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
			let cowsayTopText;
			if (inputText.length <= 50) {
				cowsayTopText = ` ${"_".repeat(inputText.length + 2)}\n` +
					`< ${inputText} >\n` +
					` ${"-".repeat(inputText.length + 2)}`;
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
					lines.push(currLine.padEnd(50, " "));
				}

				cowsayTopText = ` ${"_".repeat(52)}\n` + `/ ${lines[0]} \\\n`;
				if (lines.length > 2) {
					for (let i = 1; i < lines.length - 1; i++) {
						cowsayTopText += `| ${lines[i]} |\n`;
					}
				}
				cowsayTopText += `\\ ${lines[lines.length - 1]} /\n` + ` ${"-".repeat(52)}`;
			}

			message.channel.send("```" + cowsayTopText + "\n" +
				"        \\   ^__^\n" +
				"         \\  (oo)\\_______\n" +
				"            (__)\\       )\\/\\\n" +
				"               ||----w |\n" +
				"               ||     ||" + "```");
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
						case "0": emojified += "0️⃣ "; break;
						case "1": emojified += "1️⃣ "; break;
						case "2": emojified += "2️⃣ "; break;
						case "3": emojified += "3️⃣ "; break;
						case "4": emojified += "4️⃣ "; break;
						case "5": emojified += "5️⃣ "; break;
						case "6": emojified += "6️⃣ "; break;
						case "7": emojified += "7️⃣ "; break;
						case "8": emojified += "8️⃣ "; break;
						case "9": emojified += "9️⃣ "; break;
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
				usage: "scramble <text> [--(inner | words)]"
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
