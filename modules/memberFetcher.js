module.exports.fetchMembers = async (message, withPresences = false) => {
	return await message.guild.members.fetch({withPresences: withPresences})
		.catch(err => {
			console.error("Failed to fetch members in object resolver: " + err);
			return message.guild.members.cache;
		});
};
