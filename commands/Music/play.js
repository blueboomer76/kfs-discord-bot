const Command = require("../../structures/command.js");
const ytdl = require("ytdl-core");

class PlayCommand extends Command {
	constructor() {
		super({
			name: "play",
			description: "Play some audio",
			args: [
				{
					errorMsg: "Please provide the audio that you want to play.",
					num: Infinity,
					type: "string"
				}
			],
			flags: [
				{
					name: "seek",
					desc: "The time to seek to in the music",
					arg: {
						type: "number",
						min: 0
					}
				}
			],
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
				gvConnection.nowPlaying = null;
				gvConnection.queue = [];
				message.channel.send("Successfully joined the voice channel!");
			})
			.catch(() => cmdErr = true)
		}
		if (cmdErr) return message.channel.send("Failed to connect to the voice channel.");
		if (mvChannel.id != gvConnection.channel.id) {
			return message.channel.send("You need to be in the same voice channel as me to play audio.")
		}

		if (gvConnection.queue.includes(args[0])) {
			return message.channel.send("That audio is already in the queue.")
		}
		try {ytdl(args[0])} catch (err) {cmdErr = true;}
		if (cmdErr) return message.channel.send("Invalid YouTube URL was provided.");

		if (!gvConnection.nowPlaying) {
			gvConnection.nowPlaying = args[0];
			let seekFlag = flags.find(f => f.name == "seek");
			let seek = seekFlag ? seekFlag.args : 0;
			this.playQueue(message, seek);
			message.channel.send("That audio is now playing.")
		} else {
			if (gvConnection.queue.length < 10) {
				gvConnection.queue.push(args[0]);
				message.channel.send("That audio has been added to the queue.")
			} else {
				message.channel.send("The maximum queue limit has been reached. No more audio can be queued.");
			}
		}
	}

	playQueue(msg, seek) {
		let gvConnection = msg.guild.voiceConnection;
		let stream = ytdl(gvConnection.nowPlaying, {filter: "audioonly"});
		gvConnection.playStream(stream, {seek: seek});
		this.addDispatcherEvent(msg);
	}

	addDispatcherEvent(msg) {
		let gvConnection = msg.guild.voiceConnection;
		gvConnection.dispatcher.on("speaking", value => {
			if (value == false && gvConnection && gvConnection.dispatcher && !gvConnection.dispatcher.paused) {
				if (gvConnection.queue.length == 0) {
					gvConnection.nowPlaying = null;
					msg.channel.send("The queue has concluded.");
				} else {
					gvConnection.nowPlaying = gvConnection.queue.shift();
					this.playQueue(msg, 0);
					msg.channel.send(`Now playing: \`${gvConnection.nowPlaying}\``)
				}
			}
		})
	}
}

module.exports = PlayCommand;
