const fetchMembers = require("../modules/memberFetcher.js");

const memberRegex = /<@!?\d+>/;

function getMember(message, id) {
	let member;
	message.guild.fetchMember(id)
	.then(mem => member = mem)
	.catch(() => member = null)
	return member;
}

module.exports.resolve = async (bot, message, obj, type, params) => {
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
			const channelRegex = /<#\d+>/, guildChannels = message.guild.channels;
			let channel;
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
			const command = bot.commands.get(obj) || bot.commands.get(bot.aliases.get(obj))
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
			if (memberRegex.test(obj)) {
				const guildMembers = message.guild.large ? fetchMembers(message) : message.guild.members,
					member = guildMembers.get(obj.match(/\d+/)[0]);
				if (member) {
					return member.user.avatarURL || `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`
				} else {
					return null;
				}
			}
			const imageRegex = /^https?:\/\/.+\.(gif|jpe?g|png)$/i;
			if (imageRegex.test(obj)) {return obj} else {return null}
		case "member":
			let member;

			if (memberRegex.test(obj)) {
				member = message.guild.large ? getMember(obj.match(/\d+/)[0]) : message.guild.members.get(obj.match(/\d+/)[0]);
				return member ? [member] : null;
			}
			member = guildMembers.get(obj);

			if (member) {
				member = message.guild.large ? getMember(obj.match(/\d+/)[0]) : message.guild.members.get(obj.match(/\d+/)[0]);
				return member ? [member] : null;
			} else {
				const guildMembers = message.guild.large ? fetchMembers(message) : message.guild.members,
					comparedObj = obj.toLowerCase();
				list = guildMembers.filter(mem => {
					return mem.user.tag.toLowerCase().includes(comparedObj) ||
					mem.user.username.toLowerCase().includes(comparedObj) ||
					mem.displayName.toLowerCase().includes(comparedObj)
				}).array();
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