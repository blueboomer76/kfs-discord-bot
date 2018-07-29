const Discord = require("discord.js");

module.exports.resolve = (bot, message, obj, type) => {
	switch (type) {
		case "boolean":
			let truthy = ["yes", "y", "true", "enable"]
			let falsy = ["no", "n", "false", "disable"]
			if (truthy.some(y => obj == y)) {
				return true;
			} else if (falsy.some(n => obj == n)) {
				return false;
			} else {return null}
			break;
		case "channel":
			let channel = message.mentions.channels.first() || message.guild.channels.get(args[0]) || message.guild.channels.find("name", obj);
			if (channel) {return channel} else {return null}
			break;
		case "command":
			let command = bot.commands.get(obj) || bot.commands.get(bot.aliases.get(obj))
			if (command) {return command} else {return null}
			break;
		case "emoji":
			// Not ready
			break;
		case "guildMember":
			let member;
			let guildMembers = message.guild.members;
			if (!message.mentions.users.first()) {
				member = guildMembers.get(obj);
			} else {
				member = guildMembers.get(message.mentions.users.first().id);
			}
			if (!member) {
				let search = guildMembers.find(mem => mem.user.tag.toLowerCase().includes(obj.toLowerCase()));
				if (!search) search = guildMembers.find(mem => mem.user.username.toLowerCase().includes(obj.toLowerCase()));
				if (!search) search = guildMembers.find(mem => mem.displayName.toLowerCase().includes(obj.toLowerCase()));
				if (!search) {
					return null;
				} else {
					member = search;
				}
			}
			return member;
			break;
		case "number":
			if (!isNaN(obj.test) && obj.test >= obj.min && obj.test <= obj.max) {return Math.round(obj.test)} else {return null}
			break;
		case "role":
			let role = message.mentions.roles.first() || message.guild.roles.get(args[0]) || message.guild.channels.find("name", obj);
			if (channel) {return channel} else {return null}
			break;
		case "string":
			return obj.toString();
			break;
	}
}