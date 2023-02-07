const {MessageActionRow, MessageButton, MessageEmbed, Modal, TextInputComponent} = require("discord.js");

class Paginator {
	constructor(ctx, entries, embedProps, options) {
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
		this.paginatorEmbed = new MessageEmbed(embedProps)
			.setColor(options.embedColor || options.embedColor == 0 ? options.embedColor : Math.floor(Math.random() * 16777216));

		this.ctx = ctx;
		this.entries = entries;
		if (options.numbered) this.entries[0] = this.entries[0].map((e, i) => `${i+1}. ${e}`);

		this.params = options.params;
		this.limit = options.params ? 1 : options.limit || 25;
		this.maxPage = Math.ceil(this.entries[0].length / this.limit);
		this.setPage(options.page || 1);

		this.newLineAfterEntry = options.newLineAfterEntry || false;
		this.pinnedMsg = options.pinnedMsg;
		this.embedText = options.embedText || null;

		// After interaction is sent
		this.noStop = options.noStop || false;
		this.interactTimeLimit = options.interactTimeLimit || 30000;
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
		this.paginatorEmbed.setFooter({
			text: `Page ${this.page} / ${this.maxPage} [${this.entries[0].length} entries]`
		});

		return this.paginatorEmbed;
	}

	start() {
		if (this.entries[0].length > this.limit) {
			const buttons = {
				prev: new MessageButton().setCustomId("prev").setEmoji({name: "⬅"}).setLabel("Prev").setStyle("PRIMARY"),
				close: new MessageButton().setCustomId("close").setEmoji({name: "⏹"}).setLabel("Close").setStyle("DANGER"),
				next: new MessageButton().setCustomId("next").setEmoji({name: "➡"}).setLabel("Next").setStyle("PRIMARY"),
				goTo: new MessageButton().setCustomId("goto").setEmoji({name: "🔢"}).setLabel("Go To...").setStyle("SECONDARY")
			};

			const buttonList = this.noStop ? [buttons.prev, buttons.next] : [buttons.prev, buttons.close, buttons.next];
			if (this.maxPage > 5) buttonList.push(buttons.goTo);

			this.actionRow = new MessageActionRow().addComponents(buttonList);

			this.ctx.respond({
				content: this.embedText,
				embeds: [this.setEmbed()],
				components: [this.actionRow.toJSON()]
			})
				.then(() => {
					if (this.entries[0].length > this.limit) this.addInteractionCollector(buttonList);
				});
		} else {
			// No paginator needed, there's only one page
			this.ctx.respond({content: this.embedText, embeds: [this.setEmbed()]});
		}
	}

	addInteractionCollector() {
		const id = this.ctx.interaction.user.id;

		this.collector = this.ctx.interaction.channel.createMessageComponentCollector({
			filter: interaction => interaction.user.id == id,
			time: this.removeReactAfter,
			idle: this.interactTimeLimit
		});
		this.collector.on("collect", interaction => {
			if (interaction.customId == "prev") {
				this.paginateOnEdit(interaction, this.page - 1);
			} else if (interaction.customId == "next") {
				this.paginateOnEdit(interaction, this.page + 1);
			} else if (interaction.customId == "stop") {
				this.collector.stop("force");
				this.ctx.interaction.deleteReply();
			} else if (interaction.customId == "goto") {
				this.showGoToModal(interaction);
				interaction.awaitModalSubmit({
					filter: interaction2 => {
						return interaction2.user.id == id && interaction2.customId == "goToModal";
					},
					time: 30000
				})
					.then(response => {
						const page = parseInt(response.fields.getTextInputValue("page"));
						if (!isNaN(page)) this.paginateOnEdit(response, page);
					})
					.catch(() => {});
			}
		});
		this.collector.on("end", (collected, reason) => {
			if (reason != "force") {
				this.ctx.interaction.editReply({components: []});
			}
		});
	}

	showGoToModal(interaction) {
		const modal = new Modal()
			.setCustomId("goToModal")
			.setTitle("Go To...");
		const pageInput = new TextInputComponent()
			.setCustomId("page")
			.setLabel("What page do you want to go to?")
			.setStyle("SHORT");
		const actionRow = new MessageActionRow().addComponents([pageInput]);

		modal.addComponents(actionRow);

		interaction.showModal(modal);
	}

	paginateOnEdit(interaction, page) {
		this.setPage(page);
		interaction.update({
			content: this.embedText,
			embeds: [this.setEmbed()]
		});
	}
}

module.exports = Paginator;
