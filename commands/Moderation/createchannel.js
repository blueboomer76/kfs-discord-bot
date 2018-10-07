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
			perms: {
				bot: ["MANAGE_CHANNELS"],
				user: ["MANAGE_CHANNELS"],
				level: 0
			},
			usage: "createchannel <name>"
		});
	}
	
	async run(bot, message, args, flags) {
		let channelName = args[0].toLowerCase();
		message.guild.createChannel(channelName, {type: "text"})
		.then(() => message.channel.send(`✅ The text channel **${channelName}** has been created.`))
		.catch(err => message.channel.send("An error has occurred while trying to create the channel: `" + err + "`"))
	}
}

module.exports = CreateChannelCommand;
