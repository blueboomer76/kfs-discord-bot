const Command = require("../../structures/command.js");

class StopCommand extends Command {
	constructor() {
		super({
			name: "stop",
			description: "Stops actively playing audio",
			guildOnly: true
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
				return message.channel.send("You need to be in the same voice channel as me to stop the audio. (Overrides with server owner or `MANAGE_GUILD` permission)")
			}
		} else if (!gvConnection.dispatcher) {
			return message.channel.send("Cannot stop: no audio is playing");
		}

		gvConnection.nowPlaying = null;
		gvConnection.queue = [];
		gvConnection.dispatcher.end();
		message.react("⏹");
	}
}

module.exports = StopCommand;
