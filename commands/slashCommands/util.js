const {MessageEmbed} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	convert = require("color-convert"),
	math = require("mathjs");

const subcommands = [
	class ColorSubcommand extends Command {
		constructor() {
			super({
				name: "color",
				description: "Get information about a color",
				args: [
					{
						name: "color",
						description: "The color",
						type: "string",
						parsedType: "color",
						required: true
					}
				],
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				},
				usage: "color <hex color | rgb(0-255,0-255,0-255) | 0-255,0-255,0-255 | color name | decimal:0-16777215 | hsl(0-359,0-100,0-100) | cmyk(0-100,0-100,0-100,0-100)>"
			});
		}

		async run(ctx) {
			const decimalValue = parseInt(ctx.parsedArgs["color"]),
				rgbValues = [Math.floor(decimalValue / 65536), Math.floor(decimalValue / 256) % 256, decimalValue % 256],
				colorName = convert.rgb.keyword(rgbValues),
				cmykValues = convert.rgb.cmyk(rgbValues),
				hexValue = convert.rgb.hex(rgbValues),
				hslValues = convert.rgb.hsl(rgbValues),
				hsvValues = convert.rgb.hsv(rgbValues),
				xyzValues = convert.rgb.xyz(rgbValues),
				grayscaleValue = Math.round(convert.rgb.gray.raw(rgbValues) * 2.55);

			ctx.respond(new MessageEmbed()
				.setTitle("Color - #" + hexValue)
				.setDescription(`**Nearest CSS Color Name**: ${colorName}\n` +
					`**Hexadecimal (Hex)**: #${hexValue}\n` +
					`**RGB**: rgb(${rgbValues.join(", ")})\n` +
					`**Decimal (Integer)**: ${decimalValue}\n` +
					`**HSL**: hsl(${hslValues[0]}, ${hslValues[1]}%, ${hslValues[2]}%)\n` +
					`**CMYK**: cmyk(${cmykValues[0]}%, ${cmykValues[1]}%, ${cmykValues[2]}%, ${cmykValues[3]}%)\n` +
					`**HSV**: hsv(${hsvValues[0]}, ${hsvValues[1]}%, ${hsvValues[2]}%)\n` +
					`**XYZ**: XYZ(${xyzValues.join(", ")})`)
				.setColor(decimalValue)
				.addField("Related colors", `**Grayscale**: rgb(${(grayscaleValue + ", ").repeat(2) + grayscaleValue})\n` +
					`**Inverted**: rgb(${rgbValues.map(v => 255 - v).join(", ")})`)
			);
		}
	},
	class MathSubcommand extends Command {
		constructor() {
			super({
				name: "math",
				description: "Calculate a math expression",
				args: [
					{
						name: "expression",
						description: "The math expression",
						type: "string",
						required: true
					}
				]
			});
		}

		async run(ctx) {
			let result;
			try {
				result = math.evaluate(ctx.parsedArgs["expression"]);
			} catch (err) {
				return ctx.respond("Failed to evaluate expression: " + err.message, {level: "warning"});
			}
			ctx.respond(result);
		}
	}
];

class UtilCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "util",
			description: "Random utilities",
			subcommands: subcommands
		});
	}
}

module.exports = UtilCommandGroup;
