module.exports.fetchMembers = async (ctx, withPresences = false) => {
	return await ctx.interaction.guild.members.fetch({withPresences: withPresences})
		.catch(err => {
			console.error("Failed to fetch members in object resolver: " + err);
			return ctx.interaction.guild.members.cache;
		});
};
