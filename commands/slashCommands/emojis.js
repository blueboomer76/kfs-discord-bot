const {MessageEmbed} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	{getDateAndDurationString} = require("../../modules/functions.js"),
	Paginator = require("../../utils/paginator.js");

const subcommands = [
	class EmojiInfoSubcommand extends Command {
		constructor() {
			super({
				name: "info",
				description: "Get custom emoji information",
				args: [
					{
						name: "emoji",
						description: "The emoji",
						type: "string",
						parsedType: "emoji",
						required: true
					}
				],
				cooldown: {
					time: 15000,
					type: "channel"
				},
				perms: {
					bot: ["EMBED_LINKS"],
					user: [],
					level: 0
				}
			});
		}

		async run(ctx) {
			const emoji = ctx.parsedArgs["emoji"];
			let emojiRoleList;
			if (emoji.roles.cache.size == 0) {
				emojiRoleList = "All roles";
			} else {
				emojiRoleList = emoji.roles.cache.map(role => role.name).join(", ");
				if (emojiRoleList.length > 1000) emojiRoleList = emojiRoleList.slice(0, 1000) + "...";
			}

			ctx.respond(new MessageEmbed()
				.setTitle("Emoji - " + emoji.name)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter({text: "ID: " + emoji.id})
				.setImage(emoji.url)
				.addField("Emoji created at", getDateAndDurationString(emoji.createdTimestamp))
				.addField("Roles which can use this emoji", emojiRoleList)
				.addField("Animated", emoji.animated ? "Yes" : "No", true)
				.addField("Managed", emoji.managed ? "Yes" : "No", true)
				.addField("Emoji URL", emoji.url)
			);
		}
	},
	class EmojiListSubcommand extends Command {
		constructor() {
			super({
				name: "list",
				description: "Get this server's emojis",
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
			const emojis = ctx.interaction.guild.emojis.cache.map(e => `${e} \`:${e.name}:\``);

			new Paginator(ctx, [emojis], {title: "List of emojis - " + ctx.interaction.guild.name}, {
				limit: 20,
				noStop: true,
				page: 1,
				removeReactAfter: 60000
			}).start();
		}
	}
];

class EmojisCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "emojis",
			description: "Server emoji commands",
			subcommands: subcommands
		});
	}
}

module.exports = EmojisCommandGroup;
