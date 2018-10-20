const Discord = require("discord.js");

function setEntries(entries, options) {
	let limit = options.limit, page = options.page;
	let maxPage = Math.ceil(entries[0].length / limit);
	let displayed = [];
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
	}
}

function setEmbed(genEmbed, displayed, params, pinnedMsg) {
	if (params) {
		for (let i = 0; i < params.length; i++) {
			genEmbed[params[i]] = displayed[i];
		}
	} else {
		genEmbed.description = displayed[0].join("\n")
	}
	if (pinnedMsg) {
		if (!genEmbed.description) genEmbed.description = "";
		genEmbed.description = pinnedMsg + "\n\n" + genEmbed.description;
	}
	return genEmbed;
}

function paginateOnEdit(sentMessage, entries, options) {
	if (sentMessage.deleted) return;
	let entryObj = setEntries(entries, options);
	
	let sentEmbed = sentMessage.embeds[0];
	let embedToEdit = {
		title: sentEmbed.title,
		color: sentEmbed.color,
		footer: {
			text: `Page ${entryObj.page} / ${entryObj.maxPage}`
		},
		fields: []
	}
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
	embedToEdit = setEmbed(embedToEdit, entryObj.entries, options.params, options.pinnedMsg);
	sentMessage.edit("", {embed: embedToEdit})
}

function checkReaction(collector, limit) {
	let dif = (collector.lastReactionTime + limit) - Number(new Date());
	if (dif > 0) {
		setTimeout(checkReaction, dif, collector, limit);
	} else {
		collector.stop();
	}
}

module.exports.paginate = (message, genEmbed, entries, options) => {
	if (options.numbered) {
		entries[0] = entries[0].map((e, i) => `${i+1}. ${e}`);
	}
	let entryObj = setEntries(entries, options);
	genEmbed.color = Math.floor(Math.random() * 16777216)
	genEmbed.footer = {
		text: `Page ${entryObj.page} / ${entryObj.maxPage}`
	}
	genEmbed = setEmbed(genEmbed, entryObj.entries, options.params, options.pinnedMsg);
	
	message.channel.send("", {embed: genEmbed})
	.then(newMessage => {
		if (entries[0].length > options.limit) {
			newMessage.lastReactionTime = Number(new Date());
			let emojiList = ["⬅", "➡"];
			if (!options.noStop) emojiList.splice(1, 0, "⏹");
			if (Math.ceil(entries[0].length / options.limit) > 5) emojiList.push("🔢");
			for (let i = 0; i < emojiList.length; i++) {
				setTimeout(() => {
					newMessage.react(emojiList[i]).catch(err => {console.log(err)})
				}, i * 1000);
			}
			const pgCollector = newMessage.createReactionCollector((reaction, user) => 
				user.id == message.author.id && emojiList.includes(reaction.emoji.name)
			)
			pgCollector.on("collect", async reaction => {
				pgCollector.lastReactionTime = Number(new Date());
				let page = Number(newMessage.embeds[0].footer.text.match(/\d+/)[0]);
				switch (reaction.emoji.name) {
					case "⬅":
						options.page = page - 1;
						paginateOnEdit(pgCollector.message, entries, options);
						reaction.remove(message.author.id);
						break;
					case "➡":
						options.page = page + 1;
						paginateOnEdit(pgCollector.message, entries, options);
						reaction.remove(message.author.id);
						break;
					case "⏹":
						pgCollector.stop();
						newMessage.delete();
						break;
					case "🔢":
						let newMessage2 = await message.channel.send("What page do you want to go to?");
						reaction.remove(message.author.id);
						message.channel.awaitMessages(msg => msg.author.id == message.author.id && !isNaN(msg.content), {
							maxMatches: 1,
							time: 30000,
							errors: ["time"]
						})
						.then(collected => {
							let cMsg = collected.array()[0], goToPage = parseInt(cMsg.content);
							options.page = goToPage;
							paginateOnEdit(pgCollector.message, entries, options);
							
							let toDelete = [];
							if (!newMessage2.deleted) toDelete.push(newMessage2.id)
							if (!cMsg.deleted) toDelete.push(cMsg.id)
							if (toDelete.length > 0) message.channel.bulkDelete(toDelete);
						})
						.catch(() => {})
				}
			})
			pgCollector.on("end", reactions => {
				if (!newMessage.deleted && !reactions.has("⏹")) newMessage.clearReactions();
			});
			setTimeout(checkReaction, 30000, pgCollector, options.reactTimeLimit ? options.reactTimeLimit : 30000);
		}
	})
}
