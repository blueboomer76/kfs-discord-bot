const Discord = require("discord.js");

function setEntries(page, entries, limit) {
	let maxPage = Math.ceil(entries[0].length / limit);
	let displayed = [];
	if (page > maxPage) page = maxPage;
	if (page < 1) page = 1;
	for (let i = 0; i < entries.length; i++) {
		if (limit > 1) {
			displayed.push(entries[i].slice((page - 1) * limit, page * limit));
		} else {
			displayed.push(entries[i][page]);
		}
	}
	return {
		page: page,
		maxPage: maxPage,
		entries: displayed
	}
}

function setEmbed(genEmbed, displayed, params) {
	if (params) {
		for (let i = 0; i < params.length; i++) {
			genEmbed[params[i]] = displayed[i];
		}
	} else {
		genEmbed.description = displayed[0].join("\n")
	}
	return genEmbed;
}

function paginateOnEdit(sentMessage, page, entries, limit, params) {
	if (!sentMessage) return;
	let entryObj = setEntries(page, entries, limit);
	let displayed = entryObj.entries;
	
	let sentEmbed = sentMessage.embeds[0];
	let embedToEdit = {
		title: sentEmbed.title,
		color: sentEmbed.color,
		footer: {
			text: `Page ${entryObj.page} / ${entryObj.maxPage}`
		},
		fields: []
	}
	if (sentEmbed.author) {embedToEdit.author = sentEmbed.author}
	if (params) {
		for (let i = 0; i < params.length; i++) {
			embedToEdit[params[i]] = displayed[i];
		}
	} else {
		embedToEdit.description = displayed[0].join("\n")
	}
	sentMessage.edit("", {embed: embedToEdit})
}

module.exports = {
	generateEmbed: (page, entries, limit, params) => {
		let entryObj = setEntries(page, entries, limit);
		let genEmbed = {
			color: Math.floor(Math.random() * 16777216),
			footer: {
				text: `Page ${entryObj.page} / ${entryObj.maxPage}`
			}
		}
		genEmbed = setEmbed(genEmbed, entryObj.entries, params);
		return genEmbed;
	},
	addPgCollector: (message, newMessage, entries, limit, params) => {
		let emojiList = ["⬅", "⏹", "➡"];
		for (let i = 0; i < emojiList.length; i++) {
			setTimeout(() => {
				newMessage.react(emojiList[i]).catch(err => {console.log(err)})
			}, i * 1000);
		}
		const pgCollector = newMessage.createReactionCollector((reaction, user) => 
			user.id == message.author.id && (
			reaction.emoji.name == "⬅" ||
			reaction.emoji.name == "⏹" ||
			reaction.emoji.name == "➡"
		), {time: 60000})
		pgCollector.on("collect", reaction => {
			let page = Number(newMessage.embeds[0].footer.text.match(/\d+/)[0]);
			let chosen = reaction.emoji.name;
			if (chosen == "⬅") {
				paginateOnEdit(pgCollector.message, page - 1, entries, limit, params);
				reaction.remove(message.author.id);
			} else if (chosen == "➡") {
				paginateOnEdit(pgCollector.message, page + 1, entries, limit, params);
				reaction.remove(message.author.id);
			} else if (chosen == "⏹") {
				pgCollector.stop();
			}
		})
		pgCollector.on("end", () => {newMessage.clearReactions();})
	}
}