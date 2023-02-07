const {MessageEmbed} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	{capitalize, getDateAndDurationString, getReadableName, getStatuses} = require("../../modules/functions.js"),
	{fetchMembers} = require("../../modules/memberFetcher.js");

const subcommands = [
	class ServerInfoSubcommand extends Command {
		constructor() {
			super({
				name: "info",
				description: "Get info about this server",
				cooldown: {
					time: 120000,
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
			const guild = ctx.interaction.guild;
			const guildOwner = await ctx.interaction.guild.fetchOwner();

			const channels = {text: 0, voice: 0, categories: 0};
			for (const channel of guild.channels.cache.values()) {
				if (channel.type == "GUILD_TEXT") {
					channels.text++;
				} else if (channel.type == "GUILD_VOICE") {
					channels.voice++;
				} else if (channel.type == "GUILD_CATEGORY") {
					channels.categories++;
				}
			}

			const guildFeatures = guild.features.length != 0 ? guild.features.map(getReadableName) : "None";

			const serverInfoEmbed = new MessageEmbed()
				.setTitle("Server Info - " + guild.name)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter({text: `ID: ${guild.id} | Server stats as of`})
				.setThumbnail(guild.iconURL({format: "png", dynamic: true}))
				.setTimestamp(ctx.interaction.createdAt)
				.addField("Server created at", getDateAndDurationString(guild.createdTimestamp))
				.addField("Owner", `${guildOwner.user.tag} \`(ID ${guild.ownerId})\``)
				.addField("Region", guild.region, true)
				.addField("Verification", capitalize(guild.verificationLevel), true)
				.addField("Explicit Filter", getReadableName(guild.explicitContentFilter), true)
				.addField("2-Factor Auth", guild.mfaLevel == "ELEVATED" ? "Enabled" : "Disabled", true);

			if (ctx.bot.intents.has(["GUILD_MEMBERS", "GUILD_PRESENCES"])) {
				const guildMembers = await fetchMembers(ctx, true);
				const botCount = guildMembers.filter(mem => mem.user.bot).size;
				const statuses = getStatuses(guild.members.cache, guild.memberCount - guild.members.cache.size);

				serverInfoEmbed.addField(`Members [${guild.memberCount} total]`,
					`${statuses.online} Online, ${statuses.idle} Idle, ${statuses.dnd} DND ` +
						`(${(statuses.notOffline / guild.memberCount * 100).toFixed(1)}%) /\n` +
						statuses.offline + " Offline\n" +
					`${botCount} Bots (${(botCount / guild.memberCount * 100).toFixed(1)}%)`,
					true);
			} else {
				serverInfoEmbed.addField(`Members [${guild.memberCount} total]`, "No Other Data Available", true);
			}

			serverInfoEmbed
				.addField(`Roles [${guild.roles.cache.size - 1} total]`, "Use `/roles list` to see all roles", true)
				.addField(`Channels [${guild.channels.cache.size} total]`,
					channels.text + " Text\n" + channels.voice + " Voice\n" + channels.category + " Categories", true)
				.addField("Features", guildFeatures);

			ctx.respond(serverInfoEmbed);
		}
	}
];

class ServerCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "server",
			description: "Server commands",
			subcommands: subcommands
		});
	}
}

module.exports = ServerCommandGroup;
