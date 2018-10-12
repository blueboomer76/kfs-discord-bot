const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class HelpCommand extends Command {
	constructor() {
		super({
			name: "help",
			description: "Get help for a command, or see all commands available.",
			allowDMs: true,
			args: [
				{
					num: 1,
					optional: true,
					type: "command"
				}
			],
			cooldown: {
				time: 8000,
				type: "user"
			},
			flags: [
				{
					name: "dm",
					desc: "Sends the help message to DMs instead"
				},
			],
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			},
			usage: "help [command]"
		});
	}
	
	async run(bot, message, args, flags) {
		let command = args[0], helpEmbed = new Discord.RichEmbed();
		if (!command) {
			helpEmbed.setTitle("All the commands for this bot")
			.setColor(Math.floor(Math.random() * 16777216))
			.setFooter(`Use k,help <command> to get help for a command | Total commands: ${bot.commands.size}`);
			let cmds = bot.commands;
			if (!bot.ownerIds.includes(message.author.id) && !bot.adminIds.includes(message.author.id)) {
				cmds = cmds.filter(cmd => !cmd.hidden);
			}
			for (let i = 0; i < bot.categories.length; i++) {
				let cmdsInCat = cmds.filter(cmd => cmd.category == bot.categories[i]).map(cmd => cmd.name);
				helpEmbed.addField(bot.categories[i], Array.from(cmdsInCat).join(", "));
			}
		} else {
			let commandFlags = command.flags.map(f => `\`--${f.name}\` (\`-${f.name.charAt(0)}\`): ${f.desc}`);
			let commandPerms = command.perms;
			let permReq = {
				bot: commandPerms.bot.length > 0 ? commandPerms.bot.join(", ") : "None",
				user: commandPerms.user.length > 0 ? commandPerms.user.join(", ") : "None",
				level: bot.cache.permLevels[commandPerms.level].name
			};
			helpEmbed.setTitle(`Help - ${command.name}`)
			.setColor(Math.floor(Math.random() * 16777216))
			.addField("Category", command.category)
			.addField("Description", command.description)
			.addField("Aliases", command.aliases.length > 0 ? command.aliases.join(", ") : "None")
			.addField("Flags", command.flags.length > 0 ? commandFlags.join("\n") : "None")
			.addField("Usage", command.usage)
			.addField("Examples", command.examples.length > 0 ? commandFlags.join("\n") : "No examples provided")
			.addField("Permissions", `Bot - ${permReq.bot}\nUser - ${permReq.user} (with level ${permReq.level})`)
			.addField("Cooldown", `${command.cooldown.time / 1000} seconds per ${command.cooldown.type}`)
		}
		if (flags.find(f => f.name == "dm")) {
			message.member.send(helpEmbed);
		} else {
			message.channel.send(helpEmbed);
		}
	}
}

module.exports = HelpCommand;