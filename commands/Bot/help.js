const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class HelpCommand extends Command {
	constructor() {
		super({
			name: "help",
			description: "Get help for a command, or see all commands available.",
			args: [
				{
					num: 1,
					optional: true,
					type: "command"
				}
			],
			cooldown: {
				time: 10000,
				type: "user"
			},
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			},
			usage: "help [command]"
		});
	}
	
	async run(bot, message, args, flags) {
		let command = args[0];
		if (!command) {
			let helpEmbed = new Discord.RichEmbed()
			.setTitle("All bot commands")
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter(`Total commands: ${bot.commands.size}`);
			for (let i = 0; i < bot.categories.length; i++) {
				let cmdsInCat = bot.commands.filter(cmd => cmd.category == bot.categories[i]).map(cmd => cmd.name);
				helpEmbed.addField(bot.categories[i], cmdsInCat.join(", "));
			}
			message.channel.send(helpEmbed);
		} else {
			let commandFlags = command.flags.map(f => `--${f.name} (-${f.name.charAt(0)})`);
			let commandPerms = command.perms;
			let permReq = {
				bot: commandPerms.bot.length > 0 ? commandPerms.bot.join(", ") : "None",
				user: commandPerms.user.length > 0 ? commandPerms.user.join(", ") : "None",
				level: bot.cache.permLevels[commandPerms.level].name
			};

			message.channel.send(new Discord.RichEmbed()
			.setTitle("Help - " + command.name)
			.setColor(Math.floor(Math.random() * 16777216))
			.addField("Category", command.category)
			.addField("Description", command.description)
			.addField("Aliases", command.aliases.length > 0 ? command.aliases.join(", ") : "None")
			.addField("Flags", command.flags.length > 0 ? commandFlags.join("\n") : "None")
			.addField("Usage", command.usage)
			.addField("Server Only", command.guildOnly ? "Yes" : "No")
			.addField("Permissions", `Bot - ${permReq.bot}\nUser - ${permReq.user} (with level ${permReq.level})`)
			.addField("Cooldown", `${command.cooldown.time / 1000} seconds (per ${command.cooldown.type})`)
			);
		}
	}
}

module.exports = HelpCommand;
