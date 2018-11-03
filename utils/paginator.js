const Discord = require("discord.js");

function setEntries(entries, options) {
	const limit = options.limit, maxPage = Math.ceil(entries[0].length / limit);
	let page = options.page, displayed = [];
		
	if (page > maxPage) page = maxPage;
	if (page < 1) page = 1;
	
	if (limit > 1) {
		for (let i = 0; i < entries.length; i++) {
			displayed.push(entries[i].slice((page - 1) * limit, page * limit));
		}
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

function paginateOnEdit(sentMessage, entries, options) {
	if (sentMessage.deleted) return;
	
	const entryObj = setEntries(entries, options), sentEmbed = sentMessage.embeds[0];
	let embedToEdit = {
		title: sentEmbed.title,
		author: sentEmbed.author ? sentEmbed.author : undefined,
		color: sentEmbed.color,
		footer: {
			text: `Page ${entryObj.page} / ${entryObj.maxPage}`
		},
		thumbnail: {},
		fields: []
	}
	if (sentEmbed.thumbnail && sentEmbed.thumbnail.url) embedToEdit.thumbnail.url = sentEmbed.thumbnail.url;
	embedToEdit = setEmbed(embedToEdit, entryObj.entries, options);
	
	sentMessage.edit("", {embed: embedToEdit})
}

function checkReaction(collector, limit) {
	const dif = Number(new Date()) - collector.lastReactionTime;
	if (dif < limit - 1000) {
		setTimeout(checkReaction, dif, collector, limit);
	} else {
		collector.stop();
	}
}

/*
	Paginator options:
	- limit
	- newLineAfterEntry
	- noStop
	- numbered
	- page
	- params
	- pinnedMsg
	- reactTimeLimit
*/

module.exports.paginate = (message, genEmbed, entries, options) => {
	if (options.numbered) {
		let i = 0;
		entries[0] = entries[0].map(e => {i++; return `${i}. ${e}`})
	}
	const entryObj = setEntries(entries, options);
	genEmbed.color = Math.floor(Math.random() * 16777216)
	genEmbed.footer = {
		text: `Page ${entryObj.page} / ${entryObj.maxPage}`
	}
	genEmbed = setEmbed(genEmbed, entryObj.entries, options);
	
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
						let newMessage2;
						await message.channel.send("What page do you want to go to?")
						.then(msg2 => {newMessage2 = msg2})
						reaction.remove(message.author.id);
						message.channel.awaitMessages(msg => msg.author.id == message.author.id, {
							max: 1,
							time: 30000,
							errors: ["time"]
						})
						.then(collected => {
							const cMsg = collected.array()[0], goToPage = parseInt(cMsg.content);
							if (goToPage != NaN) {
								options.page = goToPage;
								paginateOnEdit(pgCollector.message, entries, options);
								
								let toDelete = [];
								if (!newMessage2.deleted) toDelete.push(newMessage2.id)
								if (!cMsg.deleted) toDelete.push(cMsg.id)
								if (toDelete.length > 0) message.channel.bulkDelete(toDelete);
							}
						})
						.catch(() => {})
				}
			})
			pgCollector.on("end", () => {if (!newMessage.deleted) newMessage.clearReactions()})
			setTimeout(checkReaction, 30000, pgCollector, options.reactTimeLimit ? options.reactTimeLimit : 30000);
		}
	})
}