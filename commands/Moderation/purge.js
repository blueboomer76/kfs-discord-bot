const Command = require("../../structures/command.js");

class PurgeCommand extends Command {
	constructor() {
		super({
			name: "purge",
			description: "Deletes messages from this channel",
			aliases: ["clear", "prune"],
			args: [
				{
					num: 1,
					type: "number",
					min: 1,
					max: 99
				}
			],
			category: "Moderation",
			cooldown: {
				time: 20000,
				type: "user"
			},
			flags: [
				{
					name: "bots"
				},
				{
					name: "user",
					arg: {
						type: "member"
					}
				}
			],
			guildOnly: true,
			perms: {
				bot: ["MANAGE_MESSAGES"],
				user: ["MANAGE_MESSAGES"],
				level: 1
			},
			usage: "purge <number> [--user <user>] [--bots]"
		});
	}
	
	async run(bot, message, args, flags) {
		let errorStatus = false;
		let toDelete = args[0] + 1;
		let botsFlag = flags.find(f => f.name == "bots");
		let userFlag = flags.find(f => f.name == "user");
		if (botsFlag || userFlag) {
			await message.channel.fetchMessages({"limit": args[0]})
			.then(messages => {
				toDelete = messages;
				if (botsFlag) toDelete = toDelete.filter(msg => msg.author.bot);
				if (userFlag) toDelete = toDelete.filter(msg => msg.author.id == userFlag.args.id);
				if (!toDelete.get(message.id)) toDelete.set(message.id, message);
			})
			.catch(err => {
				message.channel.send("Error occurred while trying to fetch messages: `" + err + "`")
				errorStatus = true;
			})
		}
		if (errorStatus) return;
		message.channel.bulkDelete(toDelete, true)
		.then(messages => {
			message.channel.send(`Deleted ${messages.size - 1} messages from the channel!`).then(m => m.delete(7500))
		})
		.catch(() => message.channel.send("Could not purge the messages."))
	}
}

module.exports = PurgeCommand;
