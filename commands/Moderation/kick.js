module.exports.run = async (bot, message, args) => {
	if (!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send("You don't have the required permission `KICK_MEMBERS` to run this command!");
	if (!message.guild.member(bot.user).hasPermission("KICK_MEMBERS")) return message.channel.send("The bot needs the `KICK_MEMBERS` permission.");
	if (args.length == 0) return message.channel.send("You need to provide a user to kick.");
	if (message.mentions.members.array().length > 1) return message.channel.send("You can only provide one mention to kick.");
	var kMem;
	var mention = message.mentions.members.first();
	if (mention) {
		kMem = mention;
	} else {
		kMem = message.guild.members.get(args[0]);
	}
	if (!kMem) return message.channel.send("No users were found! A valid user mention or ID is needed.");
	if (kMem.id == message.author.id || kMem.id == message.guild.owner.id || kMem.id == bot.user.id) return message.channel.send("This command cannot be used on yourself, the server owner, or the bot.");
	if (message.author.id != message.guild.owner.id && kMem.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
		return message.channel.send("Cannot kick: your highest role must be higher than the user's highest role");
	}
	kMem.kick()
	.then(() => message.channel.send(`The user ${kMem.user.tag} was kicked from the server.`))
	.catch(() => message.channel.send("Could not kick the user from the server."))
}

module.exports.help = {
	"name": "kick"
}
