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
					num: Infinity,
					type: "string"
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
		
		try {stream = ytdl(args[0], {filter: "audioonly"})} catch(err) {cmdErr = true;}
		if (cmdErr) return message.channel.send("Invalid YouTube URL was provided.");
		
		const dispatcher = bot.voiceConnections.get(message.guild.id).playStream(stream);
		dispatcher.on("end", () => {
			message.channel.send("The audio has finished.")
		})
	}
}

module.exports = PlayCommand;