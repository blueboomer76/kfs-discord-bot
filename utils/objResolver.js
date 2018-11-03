module.exports.resolve = (bot, message, obj, type, params) => {
	let lowerObj = obj.toLowerCase();
	let list;
	switch (type) {
		case "boolean":
			let truthy = ["yes", "y", "true", "enable"], falsy = ["no", "n", "false", "disable"];
			if (truthy.includes(lowerObj)) {
				return true;
			} else if (falsy.includes(lowerObj)) {
				return false;
			} else {
				return null;
			}
		case "channel":
			let channel, channelRegex = /^<#\d{17,19}>$/;
			let guildChannels = message.guild.channels;
			if (channelRegex.test(obj)) {
				channel = guildChannels.get(obj.match(/\d+/)[0]);
				if (channel) {return [channel]} else {return null}
			} else {
				channel = guildChannels.get(obj);
				if (channel) return [channel];
			}

			list = guildChannels.array().filter(chnl => {
				return chnl.name.toLowerCase().includes(lowerObj)
			});
			if (list.length > 0) {return list} else {return null}
		case "command":
			let command = bot.commands.get(lowerObj) || bot.commands.get(bot.aliases.get(lowerObj));
			if (command) {return command} else {return null}
		case "emoji":
			let emoji, emojiRegex = /^<a?:[0-9A-Za-z_]{2,}:\d{17,19}>$/, guildEmojis = message.guild.emojis;
			if (emojiRegex.test(obj)) {
				emoji = guildEmojis.get(obj.match(/\d+/)[0]);
				if (emoji) {return [emoji]} else {return null}
			} else {
				emoji = guildEmojis.get(obj);
				if (emoji) return [emoji];
			}

			list = guildEmojis.array().filter(emoji => {
				return emoji.name.toLowerCase().includes(lowerObj)
			});
			if (list.length > 0) {return list} else {return null}
		case "function":
			const testFunction = params.testFunction;
			if (testFunction(obj)) {return obj} else {return null}
		case "image":
			const imageRegex = /^https?:\/\/.+\.(gif|jpe?g|png)$/i;
			if (imageRegex.test(obj)) {return obj} else {return null}
		case "member":
			let member, memberRegex = /^<@!?\d{17,19}>$/, guildMembers = message.guild.members;
			if (memberRegex.test(obj)) {
				member = guildMembers.get(obj.match(/\d+/)[0]);
				if (member) {return [member]} else {return null}
			} else {
				member = guildMembers.get(obj);
				if (member) return [member];
			}

			list = guildMembers.array().filter(mem => {
				return mem.user.tag.toLowerCase().includes(lowerObj) ||
				mem.user.username.toLowerCase().includes(lowerObj) ||
				mem.displayName.toLowerCase().includes(lowerObj)
			});
			if (list.length > 0) {return list} else {return null}
		case "number":
			let num = Math.floor(obj);
			if (!isNaN(num) && num >= params.min && num <= params.max) {return num} else {return null}
		case "oneof":
			if (params.list.includes(lowerObj)) {return lowerObj} else {return null}
		case "role":
			let role, roleRegex = /^<@&\d{17,19}>$/, guildRoles = message.guild.roles;
			if (roleRegex.test(obj)) {
				role = guildRoles.get(obj.match(/\d+/)[0]);
				if (role) {return [role]} else {return null}
			} else {
				role = guildRoles.get(obj);
				if (role) return [role];
			}

			list = guildRoles.array().filter(role => {
				return role.name.toLowerCase().includes(lowerObj)
			});
			if (list.length > 0) {return list} else {return null}
		case "string":
			return obj.toString();
		default:
			throw new Error("Invalid argument type to check");
	}
}
