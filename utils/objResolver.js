const {fetchMembers} = require("../modules/memberFetcher.js");

const memberRegex = /^<@!?\d{17,19}>$/;

async function getMember(message, id) {
	let member;
	await message.guild.fetchMember(id).then(mem => member = mem).catch(() => member = null);
	return member;
}

module.exports.resolve = async (bot, message, obj, type, params) => {
	const lowerObj = obj.toLowerCase();
	let list;
	switch (type) {
		case "boolean":
			const truthy = ["yes", "y", "true", "enable"], falsy = ["no", "n", "false", "disable"];
			if (truthy.includes(lowerObj)) {
				return true;
			} else if (falsy.includes(lowerObj)) {
				return false;
			} else {
				return null;
			}
		case "channel":
			const channelRegex = /^<#\d{17,19}>$/, guildChannels = message.guild.channels;
			let channel;
			if (channelRegex.test(obj)) {
				channel = guildChannels.get(obj.match(/\d+/)[0]);
				if (channel) {return [channel]} else {return null}
			} else {
				channel = guildChannels.get(obj);
				if (channel) return [channel];
			}

			list = guildChannels.array().filter(chnl => {
				return chnl.name.toLowerCase().includes(lowerObj);
			});
			if (list.length > 0) {return list} else {return null}
		case "command":
			const command = bot.commands.get(lowerObj) || bot.commands.get(bot.aliases.get(lowerObj));
			if (command) {return command} else {return null}
		case "emoji":
			const emojiRegex = /^<a?:[0-9A-Za-z_]{2,}:\d{17,19}>$/, guildEmojis = message.guild.emojis;
			let emoji;
			if (emojiRegex.test(obj)) {
				emoji = guildEmojis.get(obj.match(/\d+/)[0]);
				if (emoji) {return [emoji]} else {return null}
			} else {
				emoji = guildEmojis.get(obj);
				if (emoji) return [emoji];
			}

			list = guildEmojis.array().filter(emoji => {
				return emoji.name.toLowerCase().includes(lowerObj);
			});
			if (list.length > 0) {return list} else {return null}
		case "function":
			const testFunction = params.testFunction;
			if (testFunction(obj)) {return obj} else {return null}
		case "image":
			if (memberRegex.test(obj)) {
				const guildMembers = message.guild.large ? await fetchMembers(message) : message.guild.members,
					member = guildMembers.get(obj.match(/\d+/)[0]);
				if (member) {
					return member.user.avatarURL || `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`;
				} else {
					return null;
				}
			}
			const imageRegex = /^https?:\/\/.+\.(gif|jpe?g|png)$/i;
			if (imageRegex.test(obj)) {return obj} else {return null}
		case "member":
			const idRegex = /^\d{17,19}$/;
			let member;

			if (memberRegex.test(obj)) {
				member = message.guild.large ? await getMember(message, obj.match(/\d+/)[0]) : message.guild.members.get(obj.match(/\d+/)[0]);
				return member ? [member] : null;
			} else if (idRegex.test(obj)) {
				member = message.guild.large ? await getMember(message, obj.match(/\d+/)[0]) : message.guild.members.get(obj.match(/\d+/)[0]);
				if (member) return [member];
			}

			const guildMembers = message.guild.large ? await fetchMembers(message) : message.guild.members;
			list = guildMembers.filter(mem => {
				return mem.user.tag.toLowerCase().includes(lowerObj) ||
				mem.user.username.toLowerCase().includes(lowerObj) ||
				mem.displayName.toLowerCase().includes(lowerObj);
			}).array();
			if (list.length > 0) {return list} else {return null}
		case "number":
			const num = Math.floor(obj);
			if (!isNaN(num) && num >= params.min && num <= params.max) {return num} else {return null}
		case "oneof":
			if (params.list.includes(lowerObj)) {return lowerObj} else {return null}
		case "role":
			const roleRegex = /^<@&\d{17,19}>$/, guildRoles = message.guild.roles.clone();
			guildRoles.delete(guildRoles.find(role => role.calculatedPosition == 0).id);
			let role;
			if (roleRegex.test(obj)) {
				role = guildRoles.get(obj.match(/\d+/)[0]);
				if (role) {return [role]} else {return null}
			} else {
				role = guildRoles.get(obj);
				if (role) return [role];
			}

			list = guildRoles.array().filter(role => {
				return role.name.toLowerCase().includes(lowerObj);
			});
			if (list.length > 0) {return list} else {return null}
		case "string":
			return obj.toString();
		default:
			throw new Error("Invalid argument type to check");
	}
};
