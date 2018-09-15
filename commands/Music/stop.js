const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class StopCommand extends Command {
	constructor() {
		super({
			name: "stop",
			description: "Stops actively playing music",
			guildOnly: true
		});
	}
	
	async run(bot, message, args, flags) {
		let gvConnection = message.guild.voiceConnection;
		if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
		if (!gvConnection.dispatcher) return message.channel.send("I am not playing any music")
		
		if (message.member.voiceChannel == gvConnection.channel || message.member.hasPermission("MANAGE_SERVER")) {
			gvConnection.nowPlaying = {};
			gvConnection.queue = [];
			gvConnection.dispatcher.end();
			message.react("⏹");
		} else {
			message.channel.send("This action cannot be performed unless you are in the same voice channel as me or have the `Manage Server` permission.")
		}
	}
}

module.exports = StopCommand;