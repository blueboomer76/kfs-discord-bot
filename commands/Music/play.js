const Command = require("../../structures/command.js");
const ytdl = require("ytdl-core");

class PlayCommand extends Command {
	constructor() {
		super({
			name: "play",
			description: "Play some audio",
			args: [
				{
					num: Infinity,
					type: "string"
				}
			],
			guildOnly: true,
			perms: {
				bot: ["CONNECT", "SPEAK"],
				user: [],
				level: 0
			},
			usage: "play <YouTube URL>"
		});
	}

	async run(bot, message, args, flags) {
		let mvChannel = message.member.voiceChannel;
		if (!mvChannel) return message.channel.send("You are not in a voice channel! Join one first.");
		if (!mvChannel.permissionsFor(bot.user).has("CONNECT")) return message.channel.send("I need the `CONNECT` permission in your voice channel to play audio.");

		let gvConnection = message.guild.voiceConnection;
		let cmdErr;
		if (!gvConnection) {
			await mvChannel.join()
			.then(connection => {
				gvConnection = connection;
				message.channel.send("Successfully joined the voice channel!");
				setTimeout(() => {gvConnection.disconnect()}, 3600000);
			})
			.catch(() => cmdErr = true)
		}
		if (cmdErr) return message.channel.send("Failed to connect to the voice channel.");
		if (gvConnection.dispatcher) return message.channel.send("There is already something playing in this channel.");

		let stream;
		try {
			stream = ytdl(args[0], {filter: "audioonly"});
		} catch (err) {
			cmdErr = true;
		}
		if (cmdErr) return message.channel.send("Invalid YouTube URL was provided.");

		const dispatcher = gvConnection.playStream(stream);
		dispatcher.on("end", () => message.channel.send("The audio has finished."))
	}
}

module.exports = PlayCommand;
