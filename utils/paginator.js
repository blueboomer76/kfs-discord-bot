const {RichEmbed} = require("discord.js");

class Paginator {
	constructor(message, entries, embedProps, options) {
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
		this.paginatorEmbed = new RichEmbed(embedProps)
			.setColor(options.embedColor || options.embedColor == 0 ? options.embedColor : Math.floor(Math.random() * 16777216));

		this.message = message;
		this.entries = entries;
		if (options.numbered) this.entries[0] = this.entries[0].map((e, i) => `${i+1}. ${e}`);

		this.params = options.params;
		this.limit = options.params ? 1 : options.limit || 25;
		this.maxPage = Math.ceil(this.entries[0].length / this.limit);
		this.setPage(options.page || 1);

		this.newLineAfterEntry = options.newLineAfterEntry || false;
		this.pinnedMsg = options.pinnedMsg;
		this.embedText = options.embedText || "";

		// After message is sent
		this.noStop = options.noStop || false;
		this.reactTimeLimit = options.reactTimeLimit || 30000;
		this.removeReactAfter = options.removeReactAfter;
	}

	setPage(page) {
		this.page = Math.min(Math.max(page, 1), this.maxPage);
	}

	setEmbed() {
		// Get entries
		let displayed;
		if (this.params) {
			displayed = [];
			for (let i = 0; i < this.entries.length; i++) {
				displayed.push(this.entries[i][this.page - 1]);
			}
		} else {
			displayed = this.entries[0].slice((this.page - 1) * this.limit, this.page * this.limit);
		}

		// Set the embed
		if (this.params) {
			for (let i = 0; i < this.params.length; i++) {
				this.paginatorEmbed[this.params[i]] = displayed[i];
			}
		} else {
			this.paginatorEmbed.setDescription(displayed.join(this.newLineAfterEntry ? "\n\n" : "\n"));
		}
		if (this.pinnedMsg) {
			this.paginatorEmbed.setDescription(this.pinnedMsg + "\n\n" + (this.paginatorEmbed.description || ""));
		}
		this.paginatorEmbed.setFooter(`Page ${this.page} / ${this.maxPage} [${this.entries[0].length} entries]`);

		return this.paginatorEmbed;
	}

	start() {
		this.message.channel.send(this.embedText, {embed: this.setEmbed()})
			.then(newMessage => {
				this.paginatorMessage = newMessage;

				if (this.entries[0].length <= this.limit) return;

				const emojiList = ["⬅", "➡"];
				if (!this.noStop) emojiList.splice(1, 0, "⏹");
				if (this.maxPage > 5) emojiList.push("🔢");
				for (let i = 0; i < emojiList.length; i++) {
					setTimeout(() => {
						this.paginatorMessage.react(emojiList[i]).catch(err => console.error(err));
					}, i * 1000);
				}
				this.addReactionCollector(emojiList);
			});
	}

	addReactionCollector(emojis) {
		const id = this.message.author.id;

		this.collector = this.paginatorMessage.createReactionCollector((reaction, user) => {
			return user.id == id && emojis.includes(reaction.emoji.name);
		}, this.removeReactAfter ? {time: this.removeReactAfter} : {});
		this.collector.on("collect", async reaction => {
			this.lastReactionTime = Date.now();
			switch (reaction.emoji.name) {
				case "⬅":
					this.paginateOnEdit(this.page - 1);
					break;
				case "➡":
					this.paginateOnEdit(this.page + 1);
					break;
				case "⏹":
					this.collector.stop();
					this.paginatorMessage.delete();
					return;
				case "🔢": {
					const newMessage2 = await this.message.channel.send("What page do you want to go to?");
					this.message.channel.awaitMessages(msg => msg.author.id == id && !isNaN(msg.content), {
						maxMatches: 1,
						time: 30000,
						errors: ["time"]
					})
						.then(collected => {
							const cMsg = collected.values().next().value;
							this.paginateOnEdit(parseInt(cMsg.content));

							const toDelete = [];
							if (this.message.channel.messages.has(newMessage2.id)) toDelete.push(newMessage2.id);
							if (this.message.channel.messages.has(cMsg.id)) toDelete.push(cMsg.id);
							if (toDelete.length > 0) this.message.channel.bulkDelete(toDelete);
						})
						.catch(() => {});
					break;
				}
				default:
					return;
			}
			reaction.remove(id);
		});
		this.collector.on("end", reactions => {
			if (this.message.channel.messages.has(this.paginatorMessage.id) && !reactions.has("⏹")) this.paginatorMessage.clearReactions();
		});
		this.lastReactionTime = 0;
		setTimeout(() => this.checkReaction(), this.reactTimeLimit);
	}

	paginateOnEdit(page) {
		this.setPage(page);
		if (!this.message.channel.messages.has(this.paginatorMessage.id)) return;
		this.paginatorMessage.edit(this.embedText, this.setEmbed());
	}

	checkReaction() {
		const reactTimeLeft = (this.lastReactionTime + this.reactTimeLimit) - Date.now();
		if (reactTimeLeft > 1000) {
			setTimeout(() => this.checkReaction(), reactTimeLeft);
		} else {
			this.collector.stop();
		}
	}
}

module.exports = Paginator;
