const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class CreateChannelCommand extends Command {
	constructor() {
		super({
			name: "createchannel",
			description: "Create a text channel with a given name",
			aliases: ["addch", "addchannel", "createch"],
			args: [
				{
					num: 1,
					type: "string"
				},
			],
			cooldown: {
				time: 20000,
				type: "user"
			},
			guildOnly: true,
			perms: {
				bot: ["MANAGE_CHANNELS"],
				user: ["MANAGE_CHANNELS"],
				level: 1
			},
			usage: "createchannel <name>"
		});
	}
	
	async run(bot, message, args, flags) {
		let channelNameRegex = /[^0-9a-z-_]+/
		if (channelNameRegex.test(args[0])) return message.channel.send("Channel names can only have numbers, lowercase letters, hyphens, or underscores.")
			
		await message.guild.createChannel(args[0])
		.then(message.channel.send(`✅ The channel **${args[0]}** has been created.`))
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	}
}

module.exports = CreateChannelCommand;