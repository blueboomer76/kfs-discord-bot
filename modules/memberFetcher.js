module.exports.fetchMembers = async message => {
	return await message.guild.members.fetch()
		.catch(err => {
			console.error("Failed to fetch members in object resolver: " + err);
			return message.guild.members.cache;
		});
};
