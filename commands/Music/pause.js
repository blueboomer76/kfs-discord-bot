const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class PauseCommand extends Command {
	constructor() {
		super({
			name: "pause",
			description: "Pauses actively playing music",
		});
	}
	
	async run(bot, message, args, flags) {
		let gvConnection = message.guild.voiceConnection;
		if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
		if (!message.member.voiceChannel) return message.channel.send("You are not in a voice channel")
		if (message.member.voiceChannel != gvConnection.channel) {
			return message.channel.send("You need to be in the same voice channel as me to pause music.")
		}
		if (!gvConnection.dispatcher) {
			return message.channel.send("Cannot pause: there is no music playing");
		} else if (gvConnection.dispatcher.paused) {
			return message.channel.send("Cannot pause: music is already paused");
		}
		
		gvConnection.dispatcher.pause();
		message.channel.send("Successfully paused currently playing music. Use `k,resume` to resume the audio");
	}
}

module.exports = PauseCommand;