module.exports.fetchMembers = async message => {
	return await message.guild.fetchMembers()
		.then(guild => guild.members)
		.catch(err => {
			console.error("Failed to fetch members in object resolver: " + err);
			return message.guild.members;
		});
};
