const Command = require("../../structures/command.js");

class VolumeCommand extends Command {
	constructor() {
		super({
			name: "volume",
			description: "Sets the volume of actively playing audio",
			aliases: ["vol"],
			args: [
				{
					num: 1,
					type: "number",
					min: 1,
					max: 100
				}
			],
			usage: "volume <1-100>"
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
				return message.channel.send("You need to be in the same voice channel as me to set the audio volume. (Overrides with server owner or `MANAGE_GUILD` permission)")
			}
		} else if (!gvConnection.dispatcher) {
			return message.channel.send("Cannot set volume: no audio is playing");
		}
		
		gvConnection.dispatcher.setVolume(args[0] / 100);
		message.channel.send(`🔉 Volume of audio has been set to **${args[0]}/100**`);
	}
}

module.exports = VolumeCommand;
