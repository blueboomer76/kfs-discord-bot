const Command = require("../../structures/command.js");

class DeleteChannelCommand extends Command {
	constructor() {
		super({
			name: "deletechannel",
			description: "Deletes a channel",
			aliases: ["delch", "delchannel", "deletech"],
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
			perms: {
				bot: ["MANAGE_CHANNELS"],
				user: ["MANAGE_CHANNELS"],
				level: 0
			},
			usage: "deletechannel <name>"
		});
	}
	
	async run(bot, message, args, flags) {
		let channel = args[0];

		let cmdErr;
		if (Number(new Date()) - channel.createdTimestamp > 1000 * 86400 * 180) {
			let code = Math.floor(Math.random() * 100000).toString();
			if (code.length < 5) {while (code.length < 5) {code = `0${code}`;}}
			message.channel.send(`You are about to delete the channel **${channel.name}**, which is more than 180 days old. Type \`${code}\` to proceed. This operation will time out in 30 seconds.`)
			await message.channel.awaitMessages(msg => msg.author.id == message.author.id, {
				max: 1,
				time: 30000,
				errors: ["time"]
			})
			.then(collected => {
				if (collected.array()[0].content != code) cmdErr = "You provided an invalid response, cancelling the operation.";
			})
			.catch(() => {cmdErr = "Operation has timed out after 30 seconds."})
			
			if (cmdErr) return message.channel.send(cmdErr);
		}

		channel.delete()
		.then(() => message.channel.send(`✅ The channel **${channel.name}** has been deleted.`))
		.catch(err => message.channel.send("An error has occurred while trying to delete the channel: `" + err + "`"))
	}
}

module.exports = DeleteChannelCommand;
