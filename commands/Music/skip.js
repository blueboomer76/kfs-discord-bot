const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class SkipCommand extends Command {
	constructor() {
		super({
			name: "skip",
			description: "Skips the current music track"
		});
	}
	
	async run(bot, message, args, flags) {
		let gvConnection = message.guild.voiceConnection;
		if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
		if (!message.member.voiceChannel) return message.channel.send("You are not in a voice channel")
		if (message.member.voiceChannel != gvConnection.channel) {
			return message.channel.send("You need to be in the same voice channel as me to skip music.")
		}
		if (!gvConnection.dispatcher) return message.channel.send("Cannot skip: there is no music playing");
		
		gvConnection.dispatcher.end();
		message.react("⏩");
	}
}

module.exports = SkipCommand;