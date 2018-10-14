const Command = require("../structures/command.js");
const paginator = require("../utils/paginator.js");
const ytdl = require("ytdl-core");

module.exports = [
	class LeaveCommand extends Command {
		constructor() {
			super({
				name: "leave",
				description: "Have the bot leave the voice channel it is in"
			});
		}
		
		async run(bot, message, args, flags) {
			let gvConnection = message.guild.voiceConnection;
			if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
			let mvChannel = message.member.voiceChannel;
			if (message.author.id != message.guild.owner.id) {
				if (!message.member.hasPermission("MANAGE_GUILD")) {
					if (!mvChannel) {
						return message.channel.send("You are not in a voice channel. (Overrides with server owner or `Manage Server` permission)")
					} else if (mvChannel.id != gvConnection.channel.id) {
						return message.channel.send("You need to be in the same voice channel as me to perform this command. (Overrides with server owner or `Manage Server` permission)")
					}
				}
				if (gvConnection.dispatcher) {
					return message.channel.send("The audio has not finished playing. (Overrides with server owner)")
				}
			}
	
			await gvConnection.disconnect();
			message.react("✅");
		}
	},
	class PauseCommand extends Command {
		constructor() {
			super({
				name: "pause",
				description: "Pauses actively playing audio"
			});
		}
		
		async run(bot, message, args, flags) {
			let gvConnection = message.guild.voiceConnection;
			if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
			let mvChannel = message.member.voiceChannel;
			if (message.author.id != message.guild.owner.id && !message.member.hasPermission("MANAGE_GUILD")) {
				if (!mvChannel) {
					return message.channel.send("You are not in a voice channel. (Overrides with server owner or `Manage Server` permission)")
				} else if (mvChannel.id != gvConnection.channel.id) {
					return message.channel.send("You need to be in the same voice channel as me to pause the audio. (Overrides with server owner or `Manage Server` permission)")
				}
			} else if (!gvConnection.dispatcher) {
				return message.channel.send("Cannot pause: no audio is playing");
			} else if (gvConnection.dispatcher.paused) {
				return message.channel.send("Cannot pause: audio is already paused");
			}
			
			gvConnection.dispatcher.pause();
			message.channel.send("Successfully paused the audio. Use the `resume` command to resume the audio");
		}
	},
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
			try {ytdl(args[0])} catch(err) {cmdErr = true;}
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
	},
	class QueueCommand extends Command {
		constructor() {
			super({
				name: "queue",
				description: "See this server's audio queue",
				aliases: ["playlist"],
				args: [
					{
						num: 1,
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
					bot: ["ADD_REACTIONS", "EMBED_LINKS", "MANAGE_MESSAGES"],
					user: [],
					level: 0
				},
				usage: "queue [page]"
			});
		}
		
		async run(bot, message, args, flags) {
			let gvConnection = message.guild.voiceConnection;
			if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
			let queue = gvConnection.queue;
			if (!gvConnection.nowPlaying) return message.channel.send("There is no audio in the queue.");
			
			let entries = [queue];
			if (queue.length > 0) {
				entries[0][0] = `Now playing: ${gvConnection.nowPlaying}\n\n**Next up:**\n` + entries[0][0];
			} else {
				entries[0][0] = `Now playing: ${gvConnection.nowPlaying}`;
			}
			
			paginator.paginate(message, {title: `Music Queue - ${message.guild.name}`}, entries, {
				limit: 5,
				numbered: true,
				page: args[0] ? args[0] : 1,
				params: null
			});
		}
	},
	class ResumeCommand extends Command {
		constructor() {
			super({
				name: "resume",
				description: "Resumes the audio"
			});
		}
		
		async run(bot, message, args, flags) {
			let gvConnection = message.guild.voiceConnection;
			if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
			let mvChannel = message.member.voiceChannel;
			if (message.author.id != message.guild.owner.id && !message.member.hasPermission("MANAGE_GUILD")) {
				if (!mvChannel) {
					return message.channel.send("You are not in a voice channel. (Overrides with server owner or `Manage Server` permission)")
				} else if (mvChannel.id != gvConnection.channel.id) {
					return message.channel.send("You need to be in the same voice channel as me to resume the audio. (Overrides with server owner or `Manage Server` permission)")
				}
			} else if (!gvConnection.dispatcher) {
				return message.channel.send("Cannot resume: no audio is playing");
			} else if (!gvConnection.dispatcher.paused) {
				return message.channel.send("Cannot resume: audio is already playing");
			}
			
			gvConnection.dispatcher.resume();
			message.react("▶");
		}
	},
	class SkipCommand extends Command {
		constructor() {
			super({
				name: "skip",
				description: "Skips the current audio track"
			});
		}
		
		async run(bot, message, args, flags) {
			let gvConnection = message.guild.voiceConnection;
			if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
			let mvChannel = message.member.voiceChannel;
			if (message.author.id != message.guild.owner.id && !message.member.hasPermission("MANAGE_GUILD")) {
				if (!mvChannel) {
					return message.channel.send("You are not in a voice channel. (Overrides with server owner or `Manage Server` permission)")
				} else if (mvChannel.id != gvConnection.channel.id) {
					return message.channel.send("You need to be in the same voice channel as me to skip the current audio. (Overrides with server owner or `Manage Server` permission)")
				}
			} else if (!gvConnection.dispatcher) {
				return message.channel.send("Cannot skip: no audio is playing");
			}
			
			gvConnection.dispatcher.end();
			message.react("⏩");
		}
	},
	class StopCommand extends Command {
		constructor() {
			super({
				name: "stop",
				description: "Stops actively playing audio"
			});
		}
		
		async run(bot, message, args, flags) {
			let gvConnection = message.guild.voiceConnection;
			if (!gvConnection) return message.channel.send("I am not in a voice channel in this server!")
			let mvChannel = message.member.voiceChannel;
			if (message.author.id != message.guild.owner.id && !message.member.hasPermission("MANAGE_GUILD")) {
				if (!mvChannel) {
					return message.channel.send("You are not in a voice channel. (Overrides with server owner or `Manage Server` permission)")
				} else if (mvChannel.id != gvConnection.channel.id) {
					return message.channel.send("You need to be in the same voice channel as me to stop the audio. (Overrides with server owner or `Manage Server` permission)")
				}
			} else if (!gvConnection.dispatcher) {
				return message.channel.send("Cannot stop: no audio is playing");
			}
	
			gvConnection.nowPlaying = null;
			gvConnection.queue = [];
			gvConnection.dispatcher.end();
			message.react("⏹");
		}
	},
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
					return message.channel.send("You are not in a voice channel. (Overrides with server owner or `Manage Server` permission)")
				} else if (mvChannel.id != gvConnection.channel.id) {
					return message.channel.send("You need to be in the same voice channel as me to set the audio volume. (Overrides with server owner or `Manage Server` permission)")
				}
			} else if (!gvConnection.dispatcher) {
				return message.channel.send("Cannot set volume: no audio is playing");
			}
			
			gvConnection.dispatcher.setVolume(args[0] / 100);
			message.channel.send(`🔉 Volume of audio has been set to **${args[0]}/100**`);
		}
	}
];
