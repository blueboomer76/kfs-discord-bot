module.exports.resolve = (bot, message, obj, type) => {
	let lowerObj;
	if (type != "number") lowerObj = obj.toLowerCase();
	switch (type) {
		case "boolean":
			let truthy = ["yes", "y", "true", "enable"];
			let falsy = ["no", "n", "false", "disable"];
			if (truthy.some(y => lowerObj == y)) {
				return true;
			} else if (falsy.some(n => lowerObj == n)) {
				return false;
			} else {
				return null;
			}
			break;
		case "channel":
			if (message.mentions.channels.size > 1) {return null}
			let channel = message.mentions.channels.first() || message.guild.channels.get(obj);
			if (!channel) channel = message.guild.channels.find(chnl => chnl.name.toLowerCase().includes(lowerObj));
			if (channel) {return channel} else {return null}
			break;
		case "command":
			let command = bot.commands.get(lowerObj) || bot.commands.get(bot.aliases.get(lowerObj));
			if (command) {return command} else {return null}
			break;
		case "member":
			if (message.mentions.members.size > 1) {return null}
			let member;
			let guildMembers = message.guild.members;
			message.mentions.members.forEach(mem => {
				if (mem.id != bot.user.id) member = mem;
			})
			if (!member) {
				member = guildMembers.get(obj);
				if (!member) member = guildMembers.find(mem => mem.user.tag.toLowerCase().includes(lowerObj));
				if (!member) member = guildMembers.find(mem => mem.user.username.toLowerCase().includes(lowerObj));
				if (!member) member = guildMembers.find(mem => mem.displayName.toLowerCase().includes(lowerObj));
				if (!member) return null;
			}
			return member;
			break;
		case "number":
			let num = Math.floor(obj.test);
			if (!isNaN(num) && num >= obj.min && num <= obj.max) {return num} else {return null}
			break;
		case "role":
			if (message.mentions.roles.size > 1) {return null}
			let role = message.mentions.roles.first() || message.guild.roles.get(obj);
			if (!role) role = message.guild.roles.find(role => role.name.toLowerCase().includes(lowerObj));
			if (role) {return role} else {return null}
			break;
		case "string":
			return obj.toString();
			break;
	}
}
