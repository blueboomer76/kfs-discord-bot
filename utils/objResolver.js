const Discord = require("discord.js");

module.exports.resolve = (bot, message, obj, type, params) => {
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
			let channel = message.mentions.channels.first() || message.guild.channels.get(obj);
			if (!channel) channel = message.guild.channels.find(chnl => chnl.name.toLowerCase().includes(obj.toLowerCase()));
			if (channel) {return channel} else {return null}
			break;
		case "command":
			let command = bot.commands.get(obj) || bot.commands.get(bot.aliases.get(obj))
			if (command) {return command} else {return null}
			break;
		case "duration":
			// Coming soon
			break;
		case "emoji":
			// Coming soon
			break;
		case "member":
			let member;
			let memberRegex = /<@!?\d+>/
			let guildMembers = message.guild.members;
			if (memberRegex.test(obj)) {
				let memberRegex2 = /\d+/;
				member = guildMembers.get(obj.match(memberRegex2)[0]);
			} else {
				member = guildMembers.get(obj);
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
			if (!isNaN(obj) && obj >= params.min && obj <= params.max) {return Number(obj)} else {return null}
			break;
		case "oneof":
			if (params.list.indexOf(obj) != -1) {return obj} else {return null}; 
			break;
		case "regex":
			// Coming soon
			break;
		case "role":
			let role = message.mentions.roles.first() || message.guild.roles.get(obj)
			if (!role) role = message.guild.roles.find(role => role.name.toLowerCase().includes(obj.toLowerCase()));
			if (role) {return role} else {return null}
			break;
		case "string":
			return obj.toString();
			break;
		default:
			throw new Error("Invalid argument type to check");
	}
}