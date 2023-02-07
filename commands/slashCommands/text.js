const Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js");

const grouperRegex = /<(a?:[0-9A-Za-z_]{2,}:|@!?|@&|#)\d+>|[\u0080-\uFFFF]{2}|./g,
	wordGrouperRegex = /<(a?:[0-9A-Za-z_]{2,}:|@!?|@&|#)\d+>|([\u0080-\uFFFF]{2})+|\S+/g;

const subcommands = [
	class AltCapsSubcommand extends Command {
		constructor() {
			super({
				name: "altcaps",
				description: "TuRn tExT InTo aLtErNaTiNg cApS",
				args: [
					{
						name: "text",
						description: "Input text",
						type: "string",
						required: true
					}
				]
			});
		}

		async run(ctx) {
			const text = ctx.parsedArgs["text"];
			if (text.length > 1000) return ctx.respond("That text is too long, must be under 1000 characters.", {level: "warning"});

			const toAltCaps = text.split("");
			let altCapResult = "";
			for (let i = 0; i < toAltCaps.length; i++) {
				altCapResult += i % 2 == 0 ? toAltCaps[i].toUpperCase() : toAltCaps[i].toLowerCase();
			}

			ctx.respond(altCapResult);
		}
	},
	class ClapifySubcommand extends Command {
		constructor() {
			super({
				name: "clapify",
				description: "Clapify 👏 text 👏 for 👏 you",
				args: [
					{
						name: "text",
						description: "Input text",
						type: "string",
						required: true
					}
				]
			});
		}

		async run(ctx) {
			const text = ctx.parsedArgs["text"];
			let toClapify = text.split(" ");
			if (toClapify.length == 1) toClapify = text.split("");

			const clapified = toClapify.join(" 👏 ");
			if (clapified.length >= 2000) return ctx.respond("Your input text to clapify is too long!", {level: "warning"});
			ctx.respond(clapified);
		}
	},
	class CowsaySubcommand extends Command {
		constructor() {
			super({
				name: "cowsay",
				description: "Generate cowsay text",
				args: [
					{
						name: "text",
						description: "Input text",
						type: "string",
						required: true
					}
				]
			});
		}

		async run(ctx) {
			const text = ctx.parsedArgs["text"];
			if (text.length > 1000) return ctx.respond("That text is too long, must be under 1000 characters.", {level: "warning"});

			const inputText = text.replace(/\n/g, " ");
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

			ctx.respond("```" + cowsayTopText + "\n" +
				"        \\   ^__^\n" +
				"         \\  (oo)\\_______\n" +
				"            (__)\\       )\\/\\\n" +
				"               ||----w |\n" +
				"               ||     ||" + "```");
		}
	},
	class EmojifySubcommand extends Command {
		constructor() {
			super({
				name: "emojify",
				description: "Turn text into emojis",
				args: [
					{
						name: "text",
						description: "Input text",
						type: "string",
						required: true
					}
				]
			});
		}

		async run(ctx) {
			const text = ctx.parsedArgs["text"];
			if (text.length > 85) return ctx.respond("That text is too long, must be under 85 characters.", {level: "warning"});

			const chars = text.toLowerCase().split(""), letterRegex = /[a-z]/;
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

			ctx.respond(emojified);
		}
	},
	class OwoifySubcommand extends Command {
		constructor() {
			super({
				name: "owoify",
				description: "Transforms your text into owo form :3",
				args: [
					{
						name: "text",
						description: "Input text",
						type: "string",
						required: true
					}
				]
			});
		}

		async run(ctx) {
			const text = ctx.parsedArgs["text"];
			if (text.length > 1000) return ctx.respond("That text is too long, must be under 1000 characters.", {level: "warning"});

			const owoifySuffixes = ["owo", "OWO", "uwu", "UwU", "X3", ":3", "***notices bulge** OwO, what's this?*"],
				owoified = text.toLowerCase()
					.replace(/[lr]+/g, "w")
					.replace(/n/g, "ny")
					.split(" ")
					.map(word => Math.random() < 0.25 ? `${word.charAt(0)}-${word}` : word)
					.join(" ");
			ctx.respond(owoified + " " + owoifySuffixes[Math.floor(Math.random() * owoifySuffixes.length)]);
		}
	},
	class ReverseSubcommand extends Command {
		constructor() {
			super({
				name: "reverse",
				description: "Reverses text",
				args: [
					{
						name: "text",
						description: "Input text",
						type: "string",
						required: true
					},
					{
						name: "words",
						description: "Reverse text by words",
						type: "boolean"
					}
				]
			});
		}

		async run(ctx) {
			const text = ctx.parsedArgs["text"];
			if (text.length > 1000) return ctx.respond("That text is too long, must be under 1000 characters.", {level: "warning"});

			const wordsFlag = ctx.parsedArgs["words"];
			ctx.respond(text.match(wordsFlag ? wordGrouperRegex : grouperRegex).reverse().join(wordsFlag ? " " : ""));
		}
	},
	class ScrambleSubcommand extends Command {
		constructor() {
			super({
				name: "scramble",
				description: "Scramble letters or words of text",
				args: [
					{
						name: "text",
						description: "Input text",
						type: "string",
						required: true
					},
					{
						name: "inner",
						description: "Scramble with nearest neighbors",
						type: "boolean"
					},
					{
						name: "words",
						description: "Scramble by words",
						type: "boolean"
					}
				]
			});
		}

		async run(ctx) {
			const text = ctx.parsedArgs["text"];
			if (text.length > 1000) return ctx.respond("That text is too long, must be under 1000 characters.", {level: "warning"});

			const innerFlag = ctx.parsedArgs["inner"],
				wordsFlag = ctx.parsedArgs["words"],
				toScramble = text.match(wordsFlag ? wordGrouperRegex : grouperRegex);
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
			ctx.respond(scrambled.join(wordsFlag ? " " : ""));
		}
	}
];

class TextCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "text",
			description: "Text manipulation",
			subcommands: subcommands
		});
	}
}

module.exports = TextCommandGroup;
