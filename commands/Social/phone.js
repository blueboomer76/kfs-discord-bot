const Command = require("../../structures/command.js");

class PhoneCommand extends Command {
	constructor() {
		super({
			name: "phone",
			description: "Chat with other servers on the phone!",
			aliases: ["telephone"],
			cooldown: {
				time: 20000,
				type: "channel"
			},
			guildOnly: true
		});
	}
	
	async run(bot, message, args, flags) {
		let phoneMsg, phoneMsg0;
		let phoneCache = bot.cache.phone;
		if (!phoneCache.channels.includes(message.channel.id)) {
			phoneCache.channels.push(message.channel.id);
			if (phoneCache.channels.length == 1) {
				message.react("☎");
			} else {
				phoneCache.callExpires = Number(new Date()) + 600000;
				message.channel.send("☎ A phone connection has started! Greet the other side!");
				if (phoneCache.channels.length == 2) {
					phoneMsg0 = "The other side has picked up the phone! Greet the other side!";
				} else {
					phoneMsg0 = "Looks like someone else picked up the phone."
					bot.channels.get(phoneCache.channels.shift()).send("☎ Someone else is now using the phone...");
				}
				bot.channels.get(phoneCache.channels[0]).send(`☎ ${phoneMsg0}`);
			}
		} else {
			if (phoneCache.channels.length == 1) {
				phoneMsg = "There was no response from the phone, hanging it up.";
			} else {
				let affected = 0;
				if (message.channel.id == phoneCache.channels[0]) {affected = 1};
				phoneMsg = "You have hung up the phone.";
				bot.channels.get(phoneCache.channels[affected]).send("☎ The other side hung up the phone.");
			}
			phoneCache.channels = [];
			message.channel.send(`☎ ${phoneMsg}`);
		}
	}
}

module.exports = PhoneCommand;
