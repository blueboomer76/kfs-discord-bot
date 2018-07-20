module.exports.run = async (bot, message, args) => {
	let phoneMsg, phoneMsg0;
	if (bot.phoneVars.channels.indexOf(message.channel.id) == -1) {
		bot.phoneVars.channels.push(message.channel.id);
		if (bot.phoneVars.channels.length == 1) {
			message.react("☎");
		} else {
			bot.phoneVars.callExpires = Number(new Date()) + 600000;
			message.channel.send("☎ A phone connection has started! Greet them!");
			if (bot.phoneVars.channels.length == 2) {
				phoneMsg0 = "The other side has picked up!";
			} else {
				phoneMsg0 = "Looks like someone else picked up the phone."
				bot.channels.get(bot.phoneVars.channels.shift()).send("☎ Someone else is now using the phone...");
			}
			bot.channels.get(bot.phoneVars.channels[0]).send("☎ " + phoneMsg0);
		}
	} else {
		if (bot.phoneVars.channels.length == 1) {
			phoneMsg = "There was no response from the phone, so hanging up.";
		} else {
			let affected = 0;
			phoneMsg = "The phone was hung up.";
			if (message.channel.id == bot.phoneVars.channels[0]) {affected = 1};
			bot.channels.get(bot.phoneVars.channels[affected]).send("☎ " + phoneMsg);
		}
		bot.phoneVars.channels = [];
		message.channel.send("☎ " + phoneMsg);
	}
}

module.exports.config = {
	aliases: ["telephone"],
	cooldown: {
		waitTime: 15000,
		type: "channel"
	},
	guildOnly: true,
	perms: {
		level: 0,
		reqEmbed: false,
		reqPerms: null
	}
}

module.exports.help = {
	name: "phone",
	category: "Social",
	description: "Chat with other servers on the phone!",
	usage: "phone"
}
