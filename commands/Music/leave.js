const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class LeaveCommand extends Command {
	constructor() {
		super({
			name: "leave",
			description: "Have the bot leave your voice channel",
			guildOnly: true
		});
	}
	
	async run(bot, message, args, flags) {
		let gvConnection = bot.voiceConnections.get(message.guild.id);
		if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
		if (message.member.voiceChannel == gvConnection.channel || message.member == message.guild.owner) {
			await gvConnection.disconnect();
			message.channel.send("I have left the voice channel.");
		} else {
			message.channel.send("This action cannot be done unless you are the server owner or are in the same voice channel as I am.")
		}
	}
}

module.exports = LeaveCommand;