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
					desc: "The time to seek to in the music",
					arg: {
						num: 1,
						type: "number",
						min: 0
					}
				}
			],
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
		
		let gvConnection = message.guild.voiceConnection;
		let stream, cmdErr;
		if (!gvConnection) {
			await message.member.voiceChannel.join()
			.then(connection => {
				connection.nowPlaying = {};
				connection.queue = [];
				message.channel.send("Successfully joined the voice channel!")
			})
			.catch(err => cmdErr = true)
		}
		if (cmdErr) return message.channel.send("Failed to connect to the voice channel.");
		
		if (message.member.voiceChannel != gvConnection.channel) {
			return message.channel.send("You need to be in the same voice channel as me to play music.")
		}
		
		if (gvConnection.queue.some(e => e.url == args[0])) {
			return message.channel.send("That music is already in the queue.")
		}
		
		try {ytdl(args[0])} catch(err) {cmdErr = true;}
		if (cmdErr) return message.channel.send("You have provided an invalid YouTube URL.");
		
		if (!gvConnection.nowPlaying.url) {
			gvConnection.nowPlaying = {url: args[0]};
			let seekFlag = flags.find(f => f.name == "seek");
			let seek = seekFlag ? seekFlag.args[0] : 0
			this.playQueue(message, seek);
			message.channel.send("That music is now playing.")
		} else {
			if (gvConnection.queue.length < 10) {
				gvConnection.queue.push({url: args[0]});
				message.channel.send("That music has been added to the queue.")
			} else {
				message.channel.send("The maximum queue limit has been reached. No more music can be queued.");
			}
		}
	}
	
	playQueue(msg, seek) {
		let gvConnection = msg.guild.voiceConnection;
		const dispatcher = gvConnection.playStream(ytdl(gvConnection.nowPlaying.url, {filter: "audioonly"}), {
			seek: seek
		});
		this.addDispatcherEvent(msg);
	}
	
	addDispatcherEvent(msg) {
		let gvConnection = msg.guild.voiceConnection;
		gvConnection.dispatcher.on("speaking", value => {
			if (value == false && gvConnection && gvConnection.dispatcher && !gvConnection.dispatcher.paused) {
				if (gvConnection.queue.length == 0) {
					gvConnection.nowPlaying = {};
					msg.channel.send("The queue has concluded.");
				} else {
					gvConnection.nowPlaying = gvConnection.queue.shift();
					this.playQueue(msg);
					msg.channel.send(`Now playing: \`${gvConnection.nowPlaying.url}\``)
				}
			}
		})
	}
}

module.exports = PlayCommand;