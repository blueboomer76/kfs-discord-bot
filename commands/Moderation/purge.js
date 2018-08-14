const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class PurgeCommand extends Command {
	constructor() {
		super({
			name: "purge",
			description: "Deletes messages from a channel",
			aliases: ["clear", "prune"],
			args: [
				{
					num: 1,
					type: "number",
					min: 1,
					max: 100
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
						num: 1,
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
		let userFlag = flags.find(f => f.name == "user");
		if (userFlag) {
			await message.channel.fetchMessages({"limit": args[0]})
			.then(messages => {
				console.log(userFlag.args[0]);
				toDelete = messages.array().filter(msg => msg.member == userFlag.args[0]);
				toDelete.push(message);
			})
			.catch(err => {
				message.channel.send("Error occurred while trying to fetch messages:```" + err + "```")
				errorStatus = true;
			})
		}
		let botsFlag = flags.find(f => f.name == "bots");
		if (botsFlag) {
			await message.channel.fetchMessages({"limit": args[0]})
			.then(messages => {
				toDelete = messages.array().filter(msg => msg.author.bot);
				toDelete.push(message);
			})
			.catch(err => {
				message.channel.send("Error occurred while trying to fetch messages:```" + err + "```")
				errorStatus = true;
			})
		}
		if (errorStatus) return;
		await message.channel.bulkDelete(toDelete, true)
		.then(messages => {
			message.channel.send(`Deleted ${messages.size - 1} messages from the channel!`).then(m => m.delete(7500))
		})
		.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
	}
}

module.exports = PurgeCommand;