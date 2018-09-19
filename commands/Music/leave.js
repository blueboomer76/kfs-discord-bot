const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class LeaveCommand extends Command {
	constructor() {
		super({
			name: "leave",
			description: "Have the bot leave your voice channel"
		});
	}
	
	async run(bot, message, args, flags) {
		let gvConnection = message.guild.voiceConnection;
		if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
		if (message.member.voiceChannel == gvConnection.channel || message.member.hasPermission("MANAGE_SERVER")) {
			await gvConnection.disconnect();
			message.react("✅");
		} else {
			message.channel.send("This action cannot be performed unless you are in the same voice channel as me or have the `Manage Server` permission.")
		}
	}
}

module.exports = LeaveCommand;