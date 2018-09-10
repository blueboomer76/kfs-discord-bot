const Discord = require("discord.js");
const Command = require("../../structures/command.js");
const ytdl = require("ytdl-core");

class PlayCommand extends Command {
	constructor() {
		super({
			name: "play",
			description: "Play music",
			args: [
				{
					errorMsg: "Please provide the music that you want to play.",
					num: Infinity,
					type: "string"
				}
			],
			flags: [
				{
					name: "seek",
					arg: {
						num: 1,
						type: "number",
						min: 0
					}
				}
			],
			guildOnly: true,
			perms: {
				bot: ["CONNECT"],
				user: [],
				level: 0
			},
			usage: "play <YouTube url>"
		});
	}
	
	async run(bot, message, args, flags) {
		if (!message.member.voiceChannel) return message.channel.send("You are not in a voice channel! Join one first.");
		
		let toSend = "", stream, cmdErr;
		if (!bot.voiceConnections.has(message.guild.id)) {
			await message.member.voiceChannel.join()
			.then(connection => {
				message.channel.send("Successfully joined the voice channel!")
			})
			.catch(err => cmdErr = true)
		}
		if (cmdErr) return message.channel.send("Failed to connect to the voice channel.");
		
		if (message.member.voiceChannel != bot.voiceConnections.get(message.guild.id).channel) {
			return message.channel.send("You need to be in the same voice channel as me to play music.")
		}
		try {stream = ytdl(args[0], {filter: "audioonly"})} catch(err) {cmdErr = true;}
		if (cmdErr) return message.channel.send("Invalid YouTube URL was provided.");
		
		let seekFlag = flags.find(f => f.name == "seek");
		const dispatcher = bot.voiceConnections.get(message.guild.id).playStream(stream, {
			seek: seekFlag ? seekFlag.args[0] : 0
		});
		dispatcher.on("end", reason => {
			if (!reason) {
				message.channel.send("The audio has finished");
			}
		})
	}
}

module.exports = PlayCommand;