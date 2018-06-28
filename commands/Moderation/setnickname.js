const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	if (!message.member.hasPermission("MANAGE_NICKNAMES")) return message.channel.send("You don't have the required permission `MANAGE_NICKNAMES` to run this command!");
	if (!message.guild.member(bot.user).hasPermission("MANAGE_NICKNAMES")) return message.channel.send("The bot needs the `MANAGE_NICKNAMES` permission.");
	if (args.length < 1) return message.channel.send("You need to provide a user to change the nickname.");
	if (args.length < 2) return message.channel.send("You need to provide the new nickname for the user.");
	if (message.mentions.members.array().length > 1) return message.channel.send("You can only provide one mention to change the nickname.");
	let cnMem = fList.findMember(bot, message, args[0]);
	if (!cnMem) return message.channel.send("The user provided could not be found in this server.");
	if (cnMem.id == message.author.id || cnMem.id == message.guild.owner.id || cnMem.id == bot.user.id) return message.channel.send("This command cannot be used on yourself, the server owner, or the bot.");
	if (message.author.id != message.guild.owner.id && cnMem.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
		return message.channel.send("Cannot set nickname: your highest role must be higher than the user's highest role");
	}
	let newNick = args.slice(1).join(" ");
	cnMem.setNickname(newNick)
	.then(() => message.channel.send(`:white_check_mark: Set the nickname of ${cnMem.user.tag} to ${newNick}.`))
	.catch(() => message.channel.send("Could not set the new nickname for the user."))
}

module.exports.config = {
	aliases: ["changenick", "setnick"],
	cooldown: {
		waitTime: 15000,
		type: "user"
	},
	guildOnly: true,
	perms: {
		level: 2,
		reqEmbed: false,
		reqPerms: "MANAGE_NICKNAMES"
	}
}

module.exports.help = {
	name: "setnickname",
	category: "Moderation",
	description: "Changes a user's nickname in this server",
	usage: "setnickname <user> <new nickname>"
}
