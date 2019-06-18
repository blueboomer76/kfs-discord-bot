function setEntries(entries, options) {
	const limit = options.limit, maxPage = Math.ceil(entries[0].length / limit),
		displayed = [];
	let page = options.page;
		
	if (page > maxPage) page = maxPage;
	if (page < 1) page = 1;
	if (limit > 1) {
		displayed.push(entries[0].slice((page - 1) * limit, page * limit));
	} else {
		for (let i = 0; i < entries.length; i++) {
			displayed.push(entries[i][page-1]);
		}
	}
	
	return {
		page: page,
		maxPage: maxPage,
		entries: displayed
	};
}

function setEmbed(genEmbed, displayed, options) {
	if (options.params) {
		for (let i = 0; i < options.params.length; i++) {
			genEmbed[options.params[i]] = displayed[i];
		}
	} else {
		genEmbed.description = displayed[0].join(options.newLineAfterEntry ? "\n\n" : "\n");
	}
	if (options.pinnedMsg) {
		if (!genEmbed.description) genEmbed.description = "";
		genEmbed.description = options.pinnedMsg + "\n\n" + genEmbed.description;
	}
	return genEmbed;
}

function paginateOnEdit(message, sentMessage, entries, options) {
	if (!message.channel.messages.has(sentMessage.id)) return;
	
	const entryObj = setEntries(entries, options), sentEmbed = sentMessage.embeds[0];
	let embedToEdit = {
		title: sentEmbed.title,
		color: sentEmbed.color,
		footer: {
			text: `Page ${entryObj.page} / ${entryObj.maxPage} [${entries[0].length} entries]`
		},
		fields: []
	};
	if (sentEmbed.author) {
		embedToEdit.author = {
			name: sentEmbed.author.name,
			icon_url: sentEmbed.author.iconURL,
			url: sentEmbed.author.url
		};
	}
	if (sentEmbed.thumbnail) {
		embedToEdit.thumbnail = {
			url: sentEmbed.thumbnail.url
		};
	}
	embedToEdit = setEmbed(embedToEdit, entryObj.entries, options);
	
	sentMessage.edit(options.embedText || "", {embed: embedToEdit});
}

function checkReaction(collector, limit) {
	const dif = (collector.lastReactionTime + limit) - Date.now();
	if (dif > 1000) {
		setTimeout(checkReaction, dif, collector, limit);
	} else {
		collector.stop();
	}
}

/*
	Paginator options:
	- embedColor
	- embedText
	- limit
	- newLineAfterEntry
	- noStop
	- numbered
	- page
	- params
	- pinnedMsg
	- reactTimeLimit
	- removeReactAfter
*/

module.exports.paginate = (message, genEmbed, entries, options) => {
	if (options.numbered) {
		entries[0] = entries[0].map((e, i) => `${i+1}. ${e}`);
	}
	const entryObj = setEntries(entries, options);
	genEmbed.color = options.embedColor || options.embedColor == 0 ? options.embedColor : Math.floor(Math.random() * 16777216);
	genEmbed.footer = {
		text: `Page ${entryObj.page} / ${entryObj.maxPage} [${entries[0].length} entries]`
	};
	genEmbed = setEmbed(genEmbed, entryObj.entries, options);
	
	message.channel.send(options.embedText || "", {embed: genEmbed})
		.then(newMessage => {
			if (entries[0].length > options.limit) {
				newMessage.lastReactionTime = Date.now();
				const emojiList = ["⬅", "➡"];
				if (!options.noStop) emojiList.splice(1, 0, "⏹");
				if (Math.ceil(entries[0].length / options.limit) > 5) emojiList.push("🔢");
				for (let i = 0; i < emojiList.length; i++) {
					setTimeout(() => {
						newMessage.react(emojiList[i]).catch(err => console.error(err));
					}, i * 1000);
				}
				
				const pgCollector = newMessage.createReactionCollector((reaction, user) => {
					return user.id == message.author.id && emojiList.includes(reaction.emoji.name);
				}, options.removeReactAfter ? {time: options.removeReactAfter} : {});
				pgCollector.on("collect", async reaction => {
					pgCollector.lastReactionTime = Date.now();
					const page = Number(newMessage.embeds[0].footer.text.match(/\d+/)[0]);
					switch (reaction.emoji.name) {
						case "⬅":
							options.page = page - 1;
							paginateOnEdit(message, pgCollector.message, entries, options);
							reaction.remove(message.author.id);
							break;
						case "➡":
							options.page = page + 1;
							paginateOnEdit(message, pgCollector.message, entries, options);
							reaction.remove(message.author.id);
							break;
						case "⏹":
							pgCollector.stop();
							newMessage.delete();
							break;
						case "🔢":
							const newMessage2 = await message.channel.send("What page do you want to go to?");
							reaction.remove(message.author.id);
							message.channel.awaitMessages(msg => msg.author.id == message.author.id && !isNaN(msg.content), {
								maxMatches: 1,
								time: 30000,
								errors: ["time"]
							})
								.then(collected => {
									const cMsg = collected.array()[0], goToPage = parseInt(cMsg.content);
									options.page = goToPage;
									paginateOnEdit(message, pgCollector.message, entries, options);
									
									const toDelete = [];
									if (message.channel.messages.has(newMessage2.id)) toDelete.push(newMessage2.id);
									if (message.channel.messages.has(cMsg.id)) toDelete.push(cMsg.id);
									if (toDelete.length > 0) message.channel.bulkDelete(toDelete);
								})
								.catch(() => {});
					}
				});
				pgCollector.on("end", reactions => {
					if (message.channel.messages.has(newMessage.id) && !reactions.has("⏹")) newMessage.clearReactions();
				});
				setTimeout(checkReaction, 30000, pgCollector, options.reactTimeLimit || 30000);
			}
		});
};
