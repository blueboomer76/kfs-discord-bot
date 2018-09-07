const Command = require("../../structures/command.js");

class LeaveCommand extends Command {
	constructor() {
		super({
			name: "leave",
			description: "Have the bot leave the voice channel it is in",
			guildOnly: true
		});
	}

	async run(bot, message, args, flags) {
		let gvConnection = message.guild.voiceConnection;
		if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
		let mvChannel = message.member.voiceChannel;
		if (message.author.id != message.guild.owner.id) {
			if (!message.member.hasPermission("MANAGE_GUILD")) {
				if (!mvChannel) {
					return message.channel.send("You are not in a voice channel. (Overrides with server owner or `MANAGE_GUILD` permission)")
				} else if (mvChannel.id != gvConnection.channel.id) {
					return message.channel.send("You need to be in the same voice channel as me to perform this command. (Overrides with server owner or `MANAGE_GUILD` permission)")
				}
			}
			if (gvConnection.dispatcher) {
				return message.channel.send("The audio has not finished playing. (Overrides with server owner)")
			}
		}

		await gvConnection.disconnect();
		message.channel.send("I have left the voice channel.");
	}
}

module.exports = LeaveCommand;
