const Command = require("../structures/command.js"),
	paginator = require("../utils/paginator.js"),
	ytdl = require("ytdl-core");

module.exports = [
	class LeaveCommand extends Command {
		constructor() {
			super({
				name: "leave",
				description: "Have the bot leave your voice channel"
			});
		}

		async run(bot, message, args, flags) {
			const gvConnection = message.guild.voiceConnection;
			if (!gvConnection) return {cmdErr: "I am not in a voice channel in this server!"};
			if (message.member.voiceChannel.id == gvConnection.channel.id || message.member.hasPermission("MANAGE_SERVER")) {
				await gvConnection.disconnect();
				message.react("✅");
			} else {
				return {cmdErr: "This action cannot be performed unless you are in the same voice channel as me " +
					"or have the `Manage Server` permission."};
			}
		}
	},
	class PauseCommand extends Command {
		constructor() {
			super({
				name: "pause",
				description: "Pauses actively playing music"
			});
		}

		async run(bot, message, args, flags) {
			const gvConnection = message.guild.voiceConnection;
			if (!gvConnection) return {cmdErr: "I am not in a voice channel in this server!"};
			if (!message.member.voiceChannel) return {cmdErr: "You are not in a voice channel"};
			if (message.member.voiceChannel.id != gvConnection.channel.id) {
				return {cmdErr: "You need to be in the same voice channel as me to pause music."};
			}
			if (!gvConnection.dispatcher) {
				return {cmdErr: "Cannot pause: there is no music playing"};
			} else if (gvConnection.dispatcher.paused) {
				return {cmdErr: "Cannot pause: music is already paused"};
			}

			gvConnection.dispatcher.pause();
			message.channel.send("Successfully paused currently playing music. Use `" + bot.prefix + "resume` to resume the audio");
		}
	},
	class PlayCommand extends Command {
		constructor() {
			super({
				name: "play",
				description: "Play music",
				args: [
					{
						infiniteArgs: true,
						missingArgMsg: "Please provide the music that you want to play.",
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
					bot: ["CONNECT"],
					user: [],
					level: 0
				},
				usage: "play <YouTube URL>"
			});
		}

		async run(bot, message, args, flags) {
			if (!message.member.voiceChannel) return {cmdErr: "You are not in a voice channel! Join one first."};

			const gvConnection = message.guild.voiceConnection;
			let cmdErr;
			if (!gvConnection) {
				await message.member.voiceChannel.join()
					.then(connection => {
						connection.nowPlaying = {};
						connection.queue = [];
						message.channel.send("Successfully joined the voice channel!");
					})
					.catch(() => cmdErr = true);
			}

			// Check for errors
			if (cmdErr) return {cmdErr: "Failed to connect to the voice channel."};
			if (message.member.voiceChannel.id != gvConnection.channel.id) {
				return {cmdErr: "You need to be in the same voice channel as me to play music."};
			}
			if (gvConnection.queue.length > 10) return {cmdErr: "The maximum queue limit has been reached. No more music can be queued."};
			if (gvConnection.queue.some(e => e.url == args[0])) {
				return {cmdErr: "That music is already in the queue."};
			}
			try {
				ytdl(args[0]);
			} catch(err) {
				return {cmdErr: "You have provided an invalid YouTube URL."};
			}

			if (!gvConnection.nowPlaying.url) {
				gvConnection.nowPlaying = {url: args[0]};
				const seekFlag = flags.find(f => f.name == "seek"),
					seek = seekFlag ? seekFlag.args[0] : 0;
				this.playQueue(message, seek);
				message.channel.send("That music is now playing.");
			} else {
				gvConnection.queue.push({url: args[0]});
				message.channel.send("That music has been added to the queue.");
			}
		}

		playQueue(msg, seek) {
			const gvConnection = msg.guild.voiceConnection;
			gvConnection.playStream(ytdl(gvConnection.nowPlaying.url, {filter: "audioonly"}), {
				seek: seek
			});
			this.addDispatcherEvent(msg);
		}

		addDispatcherEvent(msg) {
			const gvConnection = msg.guild.voiceConnection;
			gvConnection.dispatcher.on("speaking", value => {
				if (value == false && gvConnection && gvConnection.dispatcher && !gvConnection.dispatcher.paused) {
					if (gvConnection.queue.length == 0) {
						gvConnection.nowPlaying = {};
						msg.channel.send("The queue has concluded.");
					} else {
						gvConnection.nowPlaying = gvConnection.queue.shift();
						this.playQueue(msg);
						msg.channel.send("Now playing: `" + gvConnection.nowPlaying.url + "`");
					}
				}
			});
		}
	},
	class QueueCommand extends Command {
		constructor() {
			super({
				name: "queue",
				description: "See this server's music queue",
				aliases: ["playlist"],
				args: [
					{
						optional: true,
						type: "number",
						min: 1
					}
				],
				cooldown: {
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["EMBED_LINKS", "MANAGE_MESSAGES"],
					user: [],
					level: 0
				},
				usage: "queue [page]"
			});
		}

		async run(bot, message, args, flags) {
			const gvConnection = message.guild.voiceConnection;
			if (!gvConnection) return {cmdErr: "I am not in a voice channel in this server!"};
			const queue = gvConnection.queue;
			if (queue.length == 0 && !gvConnection.nowPlaying) return {cmdWarn: "There is no music in the queue."};

			const entries = [queue.map(e => e.url)];
			paginator.paginate(message, {title: "Music Queue - " + message.guild.name}, entries, {
				limit: 5,
				numbered: true,
				page: args[0] || 1,
				params: null,
				pinnedMsg: "Now playing: " + gvConnection.nowPlaying.url + "\n\n" + "**Next up:**\n"
			});
		}
	},
	class ResumeCommand extends Command {
		constructor() {
			super({
				name: "resume",
				description: "Resumes music"
			});
		}

		async run(bot, message, args, flags) {
			const gvConnection = message.guild.voiceConnection;
			if (!gvConnection) return {cmdErr: "I am not in a voice channel in this server!"};
			if (!message.member.voiceChannel) return {cmdErr: "You are not in a voice channel"};
			if (message.member.voiceChannel.id != gvConnection.channel.id) {
				return {cmdErr: "You need to be in the same voice channel as me to resume music."};
			}
			if (!gvConnection.dispatcher) {
				return {cmdErr: "Cannot resume: there is no music playing"};
			} else if (!gvConnection.dispatcher.paused) {
				return {cmdErr: "Cannot resume: music is already playing"};
			}

			gvConnection.dispatcher.resume();
			message.react("▶");
		}
	},
	class SkipCommand extends Command {
		constructor() {
			super({
				name: "skip",
				description: "Skips the current music track"
			});
		}

		async run(bot, message, args, flags) {
			const gvConnection = message.guild.voiceConnection;
			if (!gvConnection) return {cmdErr: "I am not in a voice channel in this server!"};
			if (!message.member.voiceChannel) return {cmdErr: "You are not in a voice channel"};
			if (message.member.voiceChannel.id != gvConnection.channel.id) {
				return {cmdErr: "You need to be in the same voice channel as me to skip music."};
			}
			if (!gvConnection.dispatcher) return {cmdErr: "Cannot skip: there is no music playing"};

			gvConnection.dispatcher.end();
			message.react("⏩");
		}
	},
	class StopCommand extends Command {
		constructor() {
			super({
				name: "stop",
				description: "Stops actively playing music"
			});
		}

		async run(bot, message, args, flags) {
			const gvConnection = message.guild.voiceConnection;
			if (!gvConnection) return {cmdErr: "I am not in a voice channel in this server!"};
			if (!gvConnection.dispatcher) return {cmdErr: "I am not playing any music"};

			if (message.member.voiceChannel.id == gvConnection.channel.id || message.member.hasPermission("MANAGE_SERVER")) {
				gvConnection.nowPlaying = {};
				gvConnection.queue = [];
				gvConnection.dispatcher.end();
				message.react("⏹");
			} else {
				return {cmdErr: "This action cannot be performed unless you are in the same voice channel as me " +
					"or have the `Manage Server` permission."};
			}
		}
	},
	class VolumeCommand extends Command {
		constructor() {
			super({
				name: "volume",
				description: "Sets the volume of actively playing music",
				aliases: ["vol"],
				args: [
					{
						type: "number",
						min: 1,
						max: 100
					}
				],
				usage: "volume <1-100>"
			});
		}

		async run(bot, message, args, flags) {
			const gvConnection = bot.voiceConnections.get(message.guild.id);
			if (!gvConnection) return {cmdErr: "I am not in a voice channel in this server!"};
			if (!message.member.voiceChannel) return {cmdErr: "You are not in a voice channel"};
			if (message.member.voiceChannel.id != gvConnection.channel.id) {
				return {cmdErr: "You need to be in the same voice channel as me to set the volume."};
			}
			if (!gvConnection.dispatcher) return {cmdErr: "Cannot set volume: there is no music playing"};

			gvConnection.dispatcher.setVolume(args[0] / 100);
			message.channel.send("🔉 Volume of music has been set to **" + args[0] + "/100**");
		}
	}
];