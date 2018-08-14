module.exports.resolve = (bot, message, obj, type, params) => {
	let lowerObj = obj.toLowerCase();
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
			let channel = message.mentions.channels.first() || message.guild.channels.get(obj);
			if (!channel) channel = message.guild.channels.find(chnl => chnl.name.toLowerCase().includes(lowerObj));
			if (channel) {return channel} else {return null}
			break;
		case "command":
			let command = bot.commands.get(lowerObj) || bot.commands.get(bot.aliases.get(lowerObj));
			if (command) {return command} else {return null}
			break;
		case "member":
			let member;
			let memberRegex = /^<@!?\d{17,19}>$/;
			let guildMembers = message.guild.members;
			if (memberRegex.test(obj)) {
				let memberRegex2 = /\d+/;
				member = guildMembers.get(obj.match(memberRegex2)[0]);
			} else {
				member = guildMembers.get(obj);
			}
			if (!member) {
				member = guildMembers.find(mem => mem.user.tag.toLowerCase().includes(lowerObj));
				if (!member) member = guildMembers.find(mem => mem.user.username.toLowerCase().includes(lowerObj));
				if (!member) member = guildMembers.find(mem => mem.displayName.toLowerCase().includes(lowerObj));
				if (!member) return null;
			}
			return member;
			break;
		case "number":
			let num = Math.floor(obj);
			if (!isNaN(num) && num >= params.min && num <= params.max) {return num} else {return null}
			break;
		case "oneof":
			if (params.list.indexOf(lowerObj) != -1) {return lowerObj} else {return null}
			break;
		case "role":
			let role = message.mentions.roles.first() || message.guild.roles.get(obj);
			if (!role) role = message.guild.roles.find(role => role.name.toLowerCase().includes(lowerObj));
			if (role) {return role} else {return null}
			break;
		case "string":
			return obj.toString();
			break;
		default:
			throw new Error("Invalid argument type to check");
	}
}
