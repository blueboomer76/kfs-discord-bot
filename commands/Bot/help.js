const Discord = require("discord.js");
const config = require("../../config.json");

module.exports = {
	run: async (bot, message, args, flags) => {
		let command = args[0];
		if (!command) {
			let cmds = [];
			bot.commands.forEach(cmd => cmds.push(cmd.commandInfo.name));
			message.channel.send(new Discord.RichEmbed()
			.setTitle("All bot commands")
			.setDescription(cmds.join(", "))
			.setColor(Math.floor(Math.random() * 16777216))
			);
		} else {
			let commandPerms = command.commandInfo.perms;
			let permReq = {
				bot: commandPerms.bot || "None",
				user: commandPerms.user || "None"
			};
			if (commandPerms.bot) permReq.bot = commandPerms.bot.join(", ");
			if (commandPerms.user) permReq.user = commandPerms.user.join(", ");

			let hEmbed = new Discord.RichEmbed()
			.setTitle("Help - " + command.commandInfo.name)
			.setColor(Math.floor(Math.random() * 16777216))
			.addField("Category", command.commandInfo.category)
			.addField("Description", command.commandInfo.description)
			if (command.commandInfo.aliases.length > 0) hEmbed.addField("Aliases", command.commandInfo.aliases.join(", "));
			if (command.commandInfo.flags) {
				let commandFlags = command.commandInfo.flags.map(f => `--${f.name} (-${f.name.charAt(0)})`);
				hEmbed.addField("Flags", commandFlags.join(", "));
			}
			hEmbed.addField("Usage", config.prefix + command.commandInfo.usage)
			.addField("Permissions", "Bot - " + permReq.bot + "\nUser - " + permReq.user);

			message.channel.send(hEmbed);
		}
	},
	commandInfo: {
		aliases: [],
		args: [
			{
				allowQuotes: false,
				num: 1,
				optional: true,
				type: "command"
			}
		],
		category: "Bot",
		cooldown: {
			time: 15000,
			type: "channel"
		},
		description: "Get help for a command, or see all commands available.",
		flags: null,
		guildOnly: false,
		name: "help",
		perms: {
			bot: ["EMBED_LINKS"],
			user: null,
			level: 0
		},
		usage: "help [command]"
	}
}
