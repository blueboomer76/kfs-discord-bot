const Discord = require("discord.js");

module.exports = {
	run: async (bot, message, args, flags) => {
		let command = args[0];
		if (!command) {
			let commandList = Array.from(bot.commands.keys()).join(", ")
			message.channel.send(new Discord.RichEmbed()
			.setTitle("All the commands for this bot")
			.setColor(Math.floor(Math.random() * 16777216))
			.setDescription(commandList)
			);
		} else {
			let searchedCmd = bot.commands.get(args[0]) || bot.commands.get(bot.aliases.get(args[0]));
			if (!searchedCmd) return message.channel.send("You provided an invalid command! See `k,help` for all the commands.\n\n*Syntax: `k,help <command>`*")
			let commandPerms = searchedCmd.commandInfo.perms
			let permReq = {
				bot: commandPerms.bot || "None",
				user: commandPerms.user || "None"
			};
			if (commandPerms.bot) {
				permReq.bot = commandPerms.bot.join(", ")
			}
			if (commandPerms.user) {
				permReq.user = commandPerms.user.join(", ")
			}
			message.channel.send(new Discord.RichEmbed()
			.setTitle("Help - " + hCmd)
			.setColor(Math.floor(Math.random() * 16777216))
			.addField("Category", sHCmd.help.category)
			.addField("Description", sHCmd.help.description)
			.addField("Usage", sHCmd.help.usage)
			.addField("Aliases", sHCmd.config.aliases.join(", "))
			.addField("Permissions", permReq)
			);
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
			level: 0,
		},
		usage: "help [command]"
	}
}