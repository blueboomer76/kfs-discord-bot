const fList = require("../../modules/functions.js");

module.exports.run = async (bot, message, args) => {
	if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send("You don't have the required permission `MANAGE_ROLES` to run this command!")
	if (args.length < 1) return message.channel.send("You need to provide a user to add a role to.")
	if (args.length < 2) return message.channel.send("You need to provide the role to remove from the user.")

	let arMem = fList.findMember(message, args[0]);
	if (!arMem) return message.channel.send("The user provided could not be found in this server.");
	if (arMem.id == message.author.id || arMem.id == bot.user.id) return message.channel.send("This command cannot be used on yourself or the bot.");

	var roleArgstext = args.slice(1).join(" ");
	var arRole = message.guild.roles.get(roleArgstext);
	if (!arRole) {
		message.guild.roles.forEach(gRole => {
			if (gRole.name == roleArgstext) arRole = gRole;
		});
	}
	if (!arRole) return message.channel.send("No roles were found.");
	var memRole = arMem.roles.get(arRole.id);
	if (memRole) return message.channel.send("The user already has that role.");

	if (message.author.id != message.guild.owner.id && arRole.comparePositionTo(message.member.highestRole) >= 0) {
		return message.channel.send("Cannot add role: your highest role must be higher than the role to add");
	}

	arMem.addRole(arRole)
	.then(() => message.channel.send(`Role ${arRole.name} has been added to the user ${arMem.user.tag}.`))
	.catch(() => message.channel.send("Could not add the role to the user."))
}

module.exports.config = {
	aliases: ["giverole", "setrole"],
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
	name: "addrole",
	category: "Moderation",
	description: "Adds a role to a user",
	usage: "addrole <user> <role>"
}
