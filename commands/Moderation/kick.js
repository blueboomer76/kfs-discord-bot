const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	if (!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send("You don't have the required permission `KICK_MEMBERS` to run this command!")
	if (args.length == 0) return message.channel.send("You need to provide a user to kick.")
	let kMem = fList.findMember(bot, message, args.join(" "));
	if (!kMem) return message.channel.send("The user provided could not be found in this server.");
	if (kMem.id == message.author.id || kMem.id == bot.user.id) return message.channel.send("This command cannot be used on yourself or the bot.");
	if (message.author.id != message.guild.owner.id && kMem.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
		return message.channel.send("Cannot kick: your highest role must be higher than the user's highest role");
	}
	kMem.kick()
	.then(() => message.channel.send(`:white_check_mark: The user ${kMem.user.tag} was kicked from the server.`))
	.catch(() => message.channel.send("Could not kick the user from the server."))
}

module.exports.config = {
	aliases: [],
	cooldown: {
		waitTime: 15000,
		type: "user"
	},
	guildOnly: true,
	perms: {
		level: 2,
		reqEmbed: false,
		reqPerms: "KICK_MEMBERS"
	}
}

module.exports.help = {
	name: "kick",
	category: "Moderation",
	description: "Kicks a user from this server",
	usage: "kick <user>"
}
