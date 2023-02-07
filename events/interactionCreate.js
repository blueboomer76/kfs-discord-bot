const CommandContext = require("../structures/commandContext.js");

module.exports = async (bot, interaction) => {
	if (!interaction.inCachedGuild() && interaction.channel.type != "DM") return;
	if (!interaction.isCommand()) return;

	const ctx = new CommandContext(interaction);

	ctx.checkCommandSync();
	if (ctx.errored) return;

	bot.cache.stats.interactionCurrentTotal++;

	await ctx.checkAllConditions();
	if (ctx.errored) return;

	await ctx.runCommand();
};
