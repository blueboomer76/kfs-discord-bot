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
	if (sentMessage.deleted) return;
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
	if (dif < limit - 500) {
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
			if (Math.ceil(entries[0].length / options.limit) > 5) emojiList.push("🔢");
			for (let i = 0; i < emojiList.length; i++) {
				if (i == 1 && options.noStop) continue;
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
						message.channel.awaitMessages(msg => msg.author.id == message.author.id && parseInt(msg.content) != NaN, {
							max: 1,
							time: 30000,
							errors: ["time"]
						})
						.then(collected => {
							options.page = parseInt(collected.array()[0].content);
							paginateOnEdit(pgCollector.message, entries, options);
							if (!newMessage2.deleted) newMessage2.delete()
						})
						.catch(() => {})
				}
			})
			pgCollector.on("end", () => {if (!newMessage.deleted) newMessage.clearReactions();})
			setTimeout(checkReaction, 30000, pgCollector, options.reactTimeLimit ? options.reactTimeLimit : 30000);
		}
	})
}