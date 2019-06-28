const {RichEmbed} = require("discord.js");

function setEntries(entries, limit, page) {
	const maxPage = Math.ceil(entries[0].length / limit), displayed = [];
	if (page > maxPage) page = maxPage;
	if (page < 1) page = 1;
	if (limit > 1) {
		displayed.push(entries[0].slice((page - 1) * limit, page * limit));
	} else {
		for (let i = 0; i < entries.length; i++) {
			displayed.push(entries[i][page-1]);
		}
	}
	
	return {page: page, maxPage: maxPage, entries: displayed};
}

function setEmbed(paginatedEmbed, displayed, options) {
	if (options.params) {
		for (let i = 0; i < options.params.length; i++) {
			paginatedEmbed[options.params[i]] = displayed[i];
		}
	} else {
		paginatedEmbed.description = displayed[0].join(options.newLineAfterEntry ? "\n\n" : "\n");
	}
	if (options.pinnedMsg) {
		paginatedEmbed.description = options.pinnedMsg + "\n\n" + (paginatedEmbed.description || "");
	}
	return paginatedEmbed;
}

function paginateOnEdit(message, sentMessage, entries, oldEmbed, options) {
	if (!message.channel.messages.has(sentMessage.id)) return;
	
	const entryData = setEntries(entries, options.limit, sentMessage.page);
	let paginatedEmbed = new RichEmbed()
		.setTitle(oldEmbed.title || "")
		.setColor(oldEmbed.color)
		.setFooter(`Page ${entryData.page} / ${entryData.maxPage} [${entries[0].length} entries]`);
	
	if (oldEmbed.author) {
		paginatedEmbed.setAuthor(oldEmbed.author.name, oldEmbed.author.icon_url || oldEmbed.author.iconURL, oldEmbed.author.url);
	}
	if (oldEmbed.thumbnail) paginatedEmbed.setThumbnail(oldEmbed.thumbnail.url);
	paginatedEmbed = setEmbed(paginatedEmbed, entryData.entries, options);
	
	sentMessage.edit(options.embedText || "", {embed: paginatedEmbed});
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
	const entryData = setEntries(entries, options.limit, options.page);
	let paginatedEmbed = new RichEmbed(genEmbed)
		.setColor(options.embedColor || options.embedColor == 0 ? options.embedColor : Math.floor(Math.random() * 16777216))
		.setFooter(`Page ${entryData.page} / ${entryData.maxPage} [${entries[0].length} entries]`);
	paginatedEmbed = setEmbed(paginatedEmbed, entryData.entries, options);
	
	message.channel.send(options.embedText || "", {embed: paginatedEmbed})
		.then(newMessage => {
			if (entries[0].length <= options.limit) return;
			
			newMessage.page = options.page;
			const emojiList = ["⬅", "➡"];
			if (!options.noStop) emojiList.splice(1, 0, "⏹");
			if (entryData.maxPage > 5) emojiList.push("🔢");
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
				switch (reaction.emoji.name) {
					case "⬅":
						newMessage.page--;
						paginateOnEdit(message, pgCollector.message, entries, paginatedEmbed, options);
						reaction.remove(message.author.id);
						break;
					case "➡":
						newMessage.page++;
						paginateOnEdit(message, pgCollector.message, entries, paginatedEmbed, options);
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
								const cMsg = collected.array()[0];
								newMessage.page = parseInt(cMsg.content);
								paginateOnEdit(message, pgCollector.message, entries, paginatedEmbed, options);
								
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
				delete newMessage.page;
			});
			pgCollector.lastReactionTime = 0;
			setTimeout(checkReaction, 30000, pgCollector, options.reactTimeLimit || 30000);
		});
};
