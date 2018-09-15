const Command = require("../../structures/command.js");
const paginator = require("../../utils/paginator.js")

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
		
		let entries = [queue.map((e, i) => `${i+1}. ${e}`)];
		if (queue.length > 0) {
			entries[0][0] = `Now playing: ${gvConnection.nowPlaying}\n\n**Next up:**\n` + entries[0][0];
		} else {
			entries[0][0] = `Now playing: ${gvConnection.nowPlaying}`;
		}
		
		let startPage = args[0] ? args[0] : 1;
		let queueEmbed = paginator.generateEmbed(startPage, entries, 5, null);
		queueEmbed.title = `Audio Queue - ${message.guild.name}`;
		message.channel.send("", {embed: queueEmbed})
		.then(newMessage => {
			if (entries[0].length > 5) {
				paginator.addPgCollector(message, newMessage, entries, 5, null);
			}
		})
	}
}

module.exports = QueueCommand;
