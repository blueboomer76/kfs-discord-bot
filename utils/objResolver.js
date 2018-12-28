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
		case "command":
			let command = bot.commands.get(obj) || bot.commands.get(bot.aliases.get(obj))
			if (command) {return command} else {return null}
		case "duration":
			// Coming soon
			break;
		case "emoji":
			let emoji, emojiRegex = /<:.{2,}:\d+>/, guildEmojis = message.guild.emojis;
			if (emojiRegex.test(obj)) {
				return [guildEmojis.get(obj.match(/\d+/)[0])];
			} else {
				emoji = guildEmojis.get(obj);
			}
			
			if (emoji) {
				return [emoji];
			} else {
				list = guildEmojis.array().filter(emoji => {
					return emoji.name.toLowerCase().includes(obj.toLowerCase())
				});
			}
			
			if (list.length > 0) {return list} else {return null};
		case "function":
			const testFunction = params.testFunction;
			if (testFunction(obj)) {return obj} else {return null};
		case "image":
			const imageRegex = /^https?:\/\/.+\.(gif|jpe?g|png)$/i;
			if (imageRegex.test(obj)) {return obj} else {return null}
		case "member":
			let member, memberRegex = /<@!?\d+>/, guildMembers = message.guild.members;
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
		case "number":
			if (!isNaN(obj) && obj >= params.min && obj <= params.max) {return Math.floor(obj)} else {return null}
		case "oneof":
			if (params.list.includes(obj)) {return obj} else {return null}; 
		case "regex":
			// Coming soon
			break;
		case "role":
			if (obj == "everyone") return null;
			const roleRegex = /<@&\d+>/, guildRoles = message.guild.roles;
			let role;
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
		case "string":
			return obj.toString();
		default:
			throw new Error("Invalid argument type to check");
	}
}