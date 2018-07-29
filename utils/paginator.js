const Discord = require("discord.js");

function setEntries(page, entries, limit) {
	let maxPage = Math.ceil(entries.length / limit);
	if (page > maxPage) page = maxPage;
	if (page < 1) page = 1;
	let pageIndex = page - 1;
	let displayed = entries.slice(pageIndex * limit, page * limit);
	return {
		page: page,
		maxPage: maxPage,
		entries: displayed
	}
}

function paginateOnEdit(sentMessage, page, entryList1, entryList2, limit) {
	if (!sentMessage) return;
	let displayedList1 = setEntries(page, entryList1, limit);
	let sentEmbed = sentMessage.embeds[0];
	let embedToEdit = {
		title: sentEmbed.title,
		color: 3391637,
		footer: {
			text: "Page " + displayedList1.page + " / " + displayedList1.maxPage
		},
		fields: []
	}
	if (sentEmbed.author) {
		embedToEdit.author = {
			name: sentEmbed.author.name,
			icon_url: sentEmbed.author.iconURL
		}
	}
	if (entryList2) {
		let displayedList2 = setEntries(page, entryList2, limit);
		let embedFields = sentMessage.embeds[0].fields
		embedToEdit.fields.push({
			name: embedFields[0].name,
			value: displayedList1.entries[0]
		});
		embedToEdit.fields.push({
			name: embedFields[1].name,
			value: displayedList2.entries[0]
		})
	} else {
		embedToEdit.description = displayedList1.entries.join("\n")
	}
	sentMessage.edit("", {embed: embedToEdit})
}

module.exports = {
	generateEmbed: (page, entryList1, entryList2, limit, fieldNames) => {
		let displayedList1 = setEntries(page, entryList1, limit);
		let paginatedEmbed = new Discord.RichEmbed()
		.setColor(3391637)
		.setFooter("Page " + displayedList1.page + " / " + displayedList1.maxPage)
		if (entryList2) {
			let displayedList2 = setEntries(page, entryList2, limit);
			paginatedEmbed.addField(fieldNames[0], displayedList1.entries[0])
			paginatedEmbed.addField(fieldNames[1], displayedList2.entries[0])
		} else {
			paginatedEmbed.setDescription(displayedList1.entries.join("\n"))
		}
		return paginatedEmbed;
	},
	addPgCollector: (message, newMessage, entryList1, entryList2, limit) => {
		let emojiList = ["⬅", "⏹", "➡"];
		for (let i = 0; i < 3; i++) {
			setTimeout(() => {
				newMessage.react(emojiList[i]).catch(err => {console.log(err)})
			}, i * 500);
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
				paginateOnEdit(pgCollector.message, page - 1, entryList1, entryList2, limit);
				reaction.remove(message.author.id);
			} else if (chosen == "➡") {
				paginateOnEdit(pgCollector.message, page + 1, entryList1, entryList2, limit);
				reaction.remove(message.author.id);
			} else if (chosen == "⏹") {
				pgCollector.stop();
			}
		})
		pgCollector.on("end", () => {newMessage.clearReactions();})
	}
}