const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send("You don't have the required permission `MANAGE_ROLES` to run this command!")
	if (args.length < 1) return message.channel.send("You need to provide a user to remove a role from.")
	if (args.length < 2) return message.channel.send("You need to provide the role to remove from the user.")

	let rrMem = fList.findMember(message, args[0]);
	if (!rrMem) return message.channel.send("The user provided could not be found in this server.");
	if (rrMem.id == message.author.id || rrMem.id == bot.user.id) return message.channel.send("This command cannot be used on yourself or the bot.");

	var roleArgstext = args.slice(1).join(" ");
	var rrRole = rrMem.roles.get(roleArgstext);
	if (!rrRole) {
		message.guild.roles.forEach(gRole => {
			if (gRole.name == roleArgstext) rrRole = gRole;
		});
	}
	if (!rrRole) return message.channel.send("The role does not exist on this server, or the user does not have that role.");

	if (message.author.id != message.guild.owner.id && rrRole.comparePositionTo(message.member.highestRole) >= 0) {
		return message.channel.send("Cannot remove role: your highest role must be higher than the role to remove");
	}

	rrMem.addRole(rrRole)
	.then(() => message.channel.send(`Role ${rrRole.name} has been removed from the user ${rrMem.user.tag}.`))
	.catch(() => message.channel.send("Could not remove the role from the user."))
}

module.exports.config = {
	aliases: ["takerole"],
	cooldown: {
		waitTime: 15000,
		type: "user"
	},
	guildOnly: true,
	perms: {
		level: 2,
		reqEmbed: false,
		reqPerms: "MANAGE_ROLES"
	}
}

module.exports.help = {
	name: "removerole",
	category: "Moderation",
	description: "Removes a role a user has",
	usage: "removerole <user> <role>"
}
