const {WebhookClient} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js");

class SuggestCommand extends Command {
	constructor() {
		super({
			name: "suggest",
			description: "Suggest new features or report problems",
			allowDMs: true,
			args: [
				{
					name: "description",
					description: "Your suggestion",
					type: "string",
					required: true
				}
			],
			cooldown: {
				time: 30000,
				type: "user"
			}
		});

		const {ideaWebhookID, ideaWebhookToken} = require("../../config.json");
		if (ideaWebhookID && ideaWebhookToken) {
			this.ideaWebhook = new WebhookClient({id: ideaWebhookID, token: ideaWebhookToken});
		}
	}

	async run(ctx) {
		if (!this.ideaWebhook) {
			return ctx.respond("The suggestions webhook has not been set up.", {level: "warning"});
		} else {
			await ctx.interaction.deferReply();
		}

		let sourceFooter;
		if (ctx.interaction.inGuild()) {
			sourceFooter = `#${ctx.interaction.channel.name} (ID ${ctx.interaction.channel.id}) in ${ctx.interaction.guild.name} ` +
				"(ID " + ctx.interaction.guild.id;
		} else {
			sourceFooter = `From ${ctx.interaction.user.tag}`;
		}

		this.ideaWebhook.send({
			embeds: [{
				description: ctx.parsedArgs["description"]
					.replace(/https?:\/\/\S+\.\S+/gi, "")
					.replace(/(www\.)?(discord\.(gg|me|io)|discord\.com\/invite)\/[0-9a-z]+/gi, ""),
				author: {
					name: ctx.interaction.user.tag,
					icon_url: ctx.interaction.user.avatarURL({format: "png", dynamic: true})
				},
				color: Math.floor(Math.random() * 16777216),
				footer: {
					text: sourceFooter,
					timestamp: ctx.interaction.createdAt
				}
			}]
		})
			.then(() => {
				ctx.respond("✅ The suggestion has been sent.");
			})
			.catch(() => {
				ctx.respond("Failed to send the suggestion.", {level: "warning"});
			});
	}
}

class SuggestCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "suggest",
			description: "Suggest new features or report problems",
			command: SuggestCommand
		});
	}
}

module.exports = SuggestCommandGroup;
