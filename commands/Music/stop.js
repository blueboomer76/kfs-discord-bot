const Discord = require("discord.js");
const Command = require("../../structures/command.js");

class StopCommand extends Command {
	constructor() {
		super({
			name: "stop",
			description: "Stops actively playing music",
			guildOnly: true,
			perms: {
				bot: [],
				user: ["MANAGE_SERVER"],
				level: 2
			}
		});
	}
	
	async run(bot, message, args, flags) {
		let gvConnection = bot.voiceConnections.get(message.guild.id);
		if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
		if (!message.member.voiceChannel) return message.channel.send("You are not in a voice channel");
		if (!gvConnection.dispatcher) return message.channel.send("I am not playing any music")
		
		if (message.member.voiceChannel == gvConnection.channel || message.member == message.guild.owner) {
			gvConnection.dispatcher.end();
			message.channel.send("Successfully stopped currently playing music")
		} else {
			message.channel.send("This action cannot be performed unless you are in the same voice channel as me or are the server owner.")
		}
	}
}

module.exports = StopCommand;