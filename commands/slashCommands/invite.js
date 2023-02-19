const {MessageEmbed} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js");

class InviteCommand extends Command {
	constructor() {
		super({
			name: "invite",
			description: "Bot invite information, server, and references",
			allowDMs: true,
			cooldown: {
				time: 30000,
				type: "guild"
			},
			perms: {
				bot: ["EMBED_LINKS"],
				user: [],
				level: 0
			}
		});
	}

	async run(ctx) {
		ctx.respond(new MessageEmbed()
			.setTitle("Bot References")
			.setDescription("Exciting! Use these links to spread the fun!")
			.setColor(Math.floor(Math.random() * 16777216))
			.addField("Bot Invite",
				`[Go!](https://discord.com/oauth2/authorize?client_id=${ctx.bot.user.id}&permissions=405921878&scope=applications.commands%20bot)`, true)
			.addField("Support Server", "[Go!](https://disboard.org/servers/308063187696091140)", true)
			.addField("Upvote this bot", "discordbots.org: [Go!](https://discordbots.org/bots/333058410465722368/vote)\n" +
				"bots.ondiscord.xyz: [Go!](https://bots.ondiscord.xyz/bots/333058410465722368)\n" +
				"botsfordiscord.com: [Go!](https://botsfordiscord.com/bots/333058410465722368/vote)", true)
		);
	}
}

class InviteCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "invite",
			description: "Get bot invite information",
			command: InviteCommand
		});
	}
}

module.exports = InviteCommandGroup;

