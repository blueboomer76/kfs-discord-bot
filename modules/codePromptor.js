const {MessageButton, MessageActionRow} = require("discord.js");

module.exports.prompt = async (ctx, notice) => {
	const promptRes = {
		originalMsg: null,
		noticeMsg: null,
		error: null
	};

	const confirmButton = new MessageButton().setCustomId("confirm").setLabel("Confirm").setStyle("SUCCESS"),
		cancelButton = new MessageButton().setCustomId("cancel").setLabel("Cancel").setStyle("DANGER");
	const actionRow = new MessageActionRow();
	actionRow.addComponents([confirmButton, cancelButton]);

	promptRes.originalMsg = await ctx.respond({
		content: "Waiting for confirmation...",
		fetchReply: true
	});
	promptRes.noticeMsg = await ctx.respond({
		content: notice + "\n\nClick \"Confirm\" below to confirm. This operation will time out in 30 seconds.",
		components: [actionRow],
		ephemeral: true,
		fetchReply: true
	}, {followUp: true});

	const id = ctx.interaction.user.id;
	try {
		const confirmInteraction = await ctx.interaction.channel.awaitMessageComponent({
			filter: interaction2 => interaction2.user.id == id && promptRes.noticeMsg.id == interaction2.message.id,
			time: 30000
		});

		if (confirmInteraction.customId != "confirm") promptRes.error = "This operation has been canceled.";
	} catch (err) {
		promptRes.error = "This operation has timed out after 30 seconds.";
	} finally {
		confirmButton.setDisabled(true);
		cancelButton.setDisabled(true);

		promptRes.noticeMsg.edit({
			content: notice + "\n\nClick \"Confirm\" below to confirm. This operation will time out in 30 seconds.",
			components: [actionRow]
		});
	}

	return promptRes;
};
