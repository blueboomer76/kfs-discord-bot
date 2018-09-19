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
			cooldown: {
				time: 20000,
				type: "user"
			},
			flags: [
				{
					name: "bots",
					desc: "Messages from bots"
				},
				{
					name: "embeds",
					desc: "Messages containing embeds"
				},
				{
					name: "text",
					desc: "Messages containing given text",
					arg: {
						type: "string"
					}
				},
				{
					name: "user",
					desc: "Messages from a user",
					arg: {
						type: "member"
					}
				}
			],
			perms: {
				bot: ["MANAGE_MESSAGES"],
				user: ["MANAGE_MESSAGES"],
				level: 1
			},
			usage: "purge <1-99> [--user <user>] [--text <text>] [--bots] [--embeds]"
		});
	}
	
	async run(bot, message, args, flags) {
		let errorStatus = false;
		let toDelete = args[0] + 1;
		if (flags.length > 0) {
			await message.channel.fetchMessages({"limit": args[0]})
			.then(messages => {
				toDelete = messages;
				for (let i = 0; i < flags.length; i++) {
					switch (flags[i].name) {
						case "bots":
							toDelete = toDelete.filter(msg => msg.author.bot);
							break;
						case "embeds":
							toDelete = toDelete.filter(msg => msg.embeds[0]);
							break;
						case "text":
							toDelete = toDelete.filter(msg => msg.content.toLowerCase().includes(flags[i].args.toLowerCase()));
							break;
						case "user":
							toDelete = toDelete.filter(msg => msg.author.id == flags[i].args.id);
					}
				}
				if (!toDelete.get(message.id)) {toDelete.set(message.id, message)};
			})
			.catch(err => {
				message.channel.send("Error occurred while trying to fetch messages: `" + err + "`")
				errorStatus = true;
			})
		}
		if (errorStatus) return;
		message.channel.bulkDelete(toDelete, true)
		.then(messages => {
			message.channel.send(`Deleted ${messages.size - 1} messages from the channel!`).then(m => m.delete(7500).catch(() => {}))
		})
		.catch(() => message.channel.send("Could not purge the messages."))
	}
}

module.exports = PurgeCommand;
