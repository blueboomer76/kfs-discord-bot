const Discord = require("discord.js");

module.exports.resolve = (bot, message, obj, type, params) => {
	let list;
	switch (type) {
		case "boolean":
			let truthy = ["yes", "y", "true", "enable"], falsy = ["no", "n", "false", "disable"];
			if (truthy.includes(obj)) {
				return true;
			} else if (falsy.includes(obj)) {
				return false;
			} else {return null}
			break;
		case "channel":
			let channel, channelRegex = /<#\d+>/;
			let guildChannels = message.guild.channels;
			if (channelRegex.test(obj)) {
				return [guildChannels.get(obj.match(/\d+/)[0])];
			} else {
				channel = guildChannels.get(obj);
			}
			if (channel) {
				return [channel];
			} else {
				list = guildChannels.array().filter(chnl => {
					return chnl.name.toLowerCase().includes(obj.toLowerCase())
				});
			}
			if (list.length > 0) {return list} else {return null}; 
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
			let member, memberRegex = /<@!?\d+>/;
			let guildMembers = message.guild.members;
			if (memberRegex.test(obj)) {
				return [guildMembers.get(obj.match(/\d+/)[0])];
			} else {
				member = guildMembers.get(obj);
			}
			if (member) {
				return [member];
			} else {
				list = guildMembers.array().filter(mem => {
					return mem.user.tag.toLowerCase().includes(obj.toLowerCase()) ||
					mem.user.username.toLowerCase().includes(obj.toLowerCase()) ||
					mem.displayName.toLowerCase().includes(obj.toLowerCase())
				});
			}
			if (list.length > 0) {return list} else {return null}; 
			break;
		case "number":
			if (!isNaN(obj) && obj >= params.min && obj <= params.max) {return Math.floor(obj)} else {return null}
			break;
		case "oneof":
			if (params.list.includes(obj)) {return obj} else {return null}; 
			break;
		case "regex":
			// Coming soon
			break;
		case "role":
			let role, roleRegex = /<@&\d+>/;
			let guildRoles = message.guild.roles;
			if (roleRegex.test(obj)) {
				return [guildRoles.get(obj.match(/\d+/)[0])];
			} else {
				role = guildRoles.get(obj);
			}
			if (role) {
				return [role];
			} else {
				list = guildRoles.array().filter(role => {
					return role.name.toLowerCase().includes(obj.toLowerCase())
				});
			}
			if (list.length > 0) {return list} else {return null}; 
			break;
		case "string":
			return obj.toString();
			break;
		default:
			throw new Error("Invalid argument type to check");
	}
}