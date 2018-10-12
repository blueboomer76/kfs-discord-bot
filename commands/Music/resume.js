const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class ResumeCommand extends Command {
	constructor() {
		super({
			name: "resume",
			description: "Resumes music"
		});
	}
	
	async run(bot, message, args, flags) {
		let gvConnection = message.guild.voiceConnection;
		if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
		if (!message.member.voiceChannel) return message.channel.send("You are not in a voice channel")
		if (message.member.voiceChannel != gvConnection.channel) {
			return message.channel.send("You need to be in the same voice channel as me to resume music.")
		}
		if (!gvConnection.dispatcher) {
			return message.channel.send("Cannot resume: there is no music playing");
		} else if (!gvConnection.dispatcher.paused) {
			return message.channel.send("Cannot resume: music is already playing");
		}
		
		gvConnection.dispatcher.resume();
		message.react("▶");
	}
}

module.exports = ResumeCommand;