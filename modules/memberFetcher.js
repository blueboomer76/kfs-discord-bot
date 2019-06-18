module.exports.fetchMembers = async message => {
	let guildMembers = message.guild.members;
	await message.guild.fetchMembers()
		.then(guild => guildMembers = guild.members)
		.catch(err => console.error("Failed to fetch members in object resolver: " + err));
	return guildMembers;
};
