module.exports.run = async (bot, message, args) => {
	if (!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send("You don't have the required permission `BAN_MEMBERS` to run this command!");
	if (!message.guild.member(bot.user).hasPermission("BAN_MEMBERS")) return message.channel.send("The bot needs the `BAN_MEMBERS` permission.");
	if (args.length == 0) return message.channel.send("You need to provide a user to ban.");
	if (message.mentions.members.array().length > 1) return message.channel.send("You can only provide one mention to ban.");
	var bMem;
	var mention = message.mentions.members.first();
	if (mention) {
		bMem = mention;
	} else {
		bMem = message.guild.members.get(args[0]);
	}
	if (!bMem) return message.channel.send("No users were found! A valid user mention or ID is needed.");
	if (bMem.id == message.author.id || bMem.id == message.guild.owner.id || bMem.id == bot.user.id) return message.channel.send("This command cannot be used on yourself, the server owner, or the bot.");
	if (message.author.id != message.guild.owner.id && bMem.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
		return message.channel.send("Cannot ban: your highest role must be higher than the user's highest role");
	}
	bMem.ban()
	.then(() => message.channel.send(`The user ${bMem.user.tag} was banned from the server.`))
	.catch(() => message.channel.send("Could not ban the user from the server."))
}

module.exports.config = {
	"aliases": null,
	"cooldown": {
		"waitTime": 15000,
		"type": "user"
	},
	"guildOnly": true,
	"perms": {
		"level": 3,
		"reqEmbed": false,
		"reqPerms": "BAN_MEMBERS"
	}
}

module.exports.help = {
	"name": "ban",
	"category": "Moderation",
	"description": "Bans a user from this server",
	"usage": "ban <user>"
}
