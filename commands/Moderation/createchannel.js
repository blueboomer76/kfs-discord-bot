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
		let channelName = args[0].toLowerCase();
		message.guild.createChannel(channelName, {type: "text"})
		.then(() => message.channel.send(`✅ The text channel **${channelName}** has been created.`))
		.catch(() => message.channel.send("Could not create the channel."))
	}
}

module.exports = CreateChannelCommand;
