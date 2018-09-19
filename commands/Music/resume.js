const Command = require("../../structures/command.js");

class ResumeCommand extends Command {
	constructor() {
		super({
			name: "resume",
			description: "Resumes the audio"
		});
	}
	
	async run(bot, message, args, flags) {
		let gvConnection = message.guild.voiceConnection;
		if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
		let mvChannel = message.member.voiceChannel;
		if (message.author.id != message.guild.owner.id && !message.member.hasPermission("MANAGE_GUILD")) {
			if (!mvChannel) {
				return message.channel.send("You are not in a voice channel. (Overrides with server owner or `MANAGE_GUILD` permission)")
			} else if (mvChannel.id != gvConnection.channel.id) {
				return message.channel.send("You need to be in the same voice channel as me to resume the audio. (Overrides with server owner or `MANAGE_GUILD` permission)")
			}
		} else if (!gvConnection.dispatcher) {
			return message.channel.send("Cannot resume: no audio is playing");
		} else if (!gvConnection.dispatcher.paused) {
			return message.channel.send("Cannot resume: audio is already playing");
		}
		
		gvConnection.dispatcher.resume();
		message.react("▶");
	}
}

module.exports = ResumeCommand;
