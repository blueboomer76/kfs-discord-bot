const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class DeleteChannelCommand extends Command {
	constructor() {
		super({
			name: "deletechannel",
			description: "Deletes a channel",
			aliases: ["delch", "delchannel", "delch"],
			args: [
				{
					num: Infinity,
					type: "channel"
				},
			],
			cooldown: {
				time: 30000,
				type: "user"
			},
			guildOnly: true,
			perms: {
				bot: ["MANAGE_CHANNELS"],
				user: ["MANAGE_CHANNELS"],
				level: 1
			},
			usage: "deletechannel <name>"
		});
	}
	
	async run(bot, message, args, flags) {
		let code = Math.floor(Math.random() * 100000).toString();
		if (code.length < 5) {
			while (code.length < 5) {
				code = "0" + code;
			}
		}
		message.channel.send(`You are about to delete the channel **${args[0].name}**. Type \`${code}\` to proceed. This operation will time out in 30 seconds.`)
		message.channel.awaitMessages(msg => msg.author.id == message.author.id && msg.content == code, {
			max: 1,
			time: 30000,
			errors: ["time"]
		})
		.then(async () => {
			await message.guild.deleteChannel(args[0])
			.then(message.channel.send(`✅ The channel **${args[0].name}** has been deleted.`))
			.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
		})
		.catch(() => message.channel.send("Operation cancelled."))
		
	}
}

module.exports = DeleteChannelCommand;