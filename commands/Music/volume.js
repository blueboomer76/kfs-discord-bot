const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class VolumeCommand extends Command {
	constructor() {
		super({
			name: "volume",
			description: "Sets the volume of actively playing music",
			aliases: ["vol"],
			args: [
				{
					num: 1,
					type: "number",
					min: 1,
					max: 100
				}
			],
			guildOnly: true,
			usage: "volume <1-100>"
		});
	}
	
	async run(bot, message, args, flags) {
		let gvConnection = bot.voiceConnections.get(message.guild.id);
		if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
		if (!message.member.voiceChannel) return message.channel.send("You are not in a voice channel")
		if (message.member.voiceChannel != gvConnection.channel) {
			return message.channel.send("You need to be in the same voice channel as me to set the volume.")
		}
		if (!gvConnection.dispatcher) return message.channel.send("Cannot set volume: there is no music playing");
		
		gvConnection.dispatcher.setVolume(args[0] / 100);
		message.channel.send(`🔉 Volume of music has been set to **${args[0]}/100**`);
	}
}

module.exports = VolumeCommand;