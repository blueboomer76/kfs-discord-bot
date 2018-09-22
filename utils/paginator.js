const Discord = require("discord.js");

function setEntries(entries, options) {
	let limit = options.limit, page = options.page;
	let maxPage = Math.ceil(entries[0].length / limit);
	let displayed = [];
	if (page > maxPage) page = maxPage;
	if (page < 1) page = 1;
	for (let i = 0; i < entries.length; i++) {
		if (limit > 1) {
			displayed.push(entries[i].slice((page - 1) * limit, page * limit));
		} else {
			displayed.push(entries[i][page-1]);
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

function paginateOnEdit(sentMessage, entries, options) {
	if (!sentMessage) return;
	let entryObj = setEntries(entries, options);
	
	let sentEmbed = sentMessage.embeds[0];
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
	if (sentEmbed.thumbnail && sentEmbed.thumbnail.url) {embedToEdit.thumbnail.url = sentEmbed.thumbnail.url}
	embedToEdit = setEmbed(embedToEdit, entryObj.entries, options.params);
	sentMessage.edit("", {embed: embedToEdit})
}

function checkReaction(collector, limit) {
	let dif = Number(new Date()) - collector.lastReactionTime;
	if (dif < limit) {
		setTimeout(checkReaction, dif, collector, limit);
	} else {
		collector.stop();
	}
}

module.exports.paginate = (message, genEmbed, entries, options) => {
	if (options.numbered) {
		let i = 0;
		entries[0] = entries[0].map(e => {i++; return `${i}. ${e}`})
	}
	let entryObj = setEntries(entries, options);
	genEmbed.color = Math.floor(Math.random() * 16777216)
	genEmbed.footer = {
		text: `Page ${entryObj.page} / ${entryObj.maxPage}`
	}
	genEmbed = setEmbed(genEmbed, entryObj.entries, options.params);
	message.channel.send("", {embed: genEmbed})
	.then(newMessage => {
		if (entries[0].length > options.limit) {
			newMessage.lastReactionTime = Number(new Date());
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
			))
			pgCollector.on("collect", reaction => {
				pgCollector.lastReactionTime = Number(new Date());
				let page = Number(newMessage.embeds[0].footer.text.match(/\d+/)[0]);
				let chosen = reaction.emoji.name;
				if (chosen == "⬅") {
					options.page = page - 1;
					paginateOnEdit(pgCollector.message, entries, options);
					reaction.remove(message.author.id);
				} else if (chosen == "➡") {
					options.page = page + 1;
					paginateOnEdit(pgCollector.message, entries, options);
					reaction.remove(message.author.id);
				} else if (chosen == "⏹") {
					pgCollector.stop();
				}
			})
			pgCollector.on("end", () => {newMessage.clearReactions();})
			setTimeout(checkReaction, 30000, pgCollector, options.reactTimeLimit ? options.reactTimeLimit : 30000);
		}
	})
}