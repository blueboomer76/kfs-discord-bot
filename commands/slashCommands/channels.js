const {MessageEmbed} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	promptor = require("../../modules/codePromptor.js"),
	{getDateAndDurationString, capitalize} = require("../../modules/functions.js");

const subcommands = [
	class ChannelInfoSubcommand extends Command {
		constructor() {
			super({
				name: "info",
				description: "Get info about a channel",
				args: [
					{
						name: "channel",
						description: "The channel",
						type: "channel"
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
			const channel = ctx.parsedArgs["channel"] || ctx.interaction.channel;
			let accessible = "No";
			if (channel.permissionsFor(ctx.interaction.guild.roles.everyone).has("VIEW_CHANNEL")) {
				accessible = channel.permissionsFor(ctx.interaction.guild.roles.everyone).has("READ_MESSAGE_HISTORY") ? "Yes" : "Partial";
			}

			const channelEmbed = new MessageEmbed()
				.setTitle("Channel Info - " + channel.name)
				.setColor(Math.floor(Math.random() * 16777216))
				.setFooter({text: "ID: " + channel.id})
				.addField("Channel created at", getDateAndDurationString(channel.createdTimestamp))
				.addField("Type", capitalize(channel.type), true)
				.addField("Category Parent", channel.parent ? channel.parent.name : "None", true)
				.addField("Accessible to everyone", accessible, true);

			const uncategorized = ctx.interaction.guild.channels.cache.filter(c => c.type != "GUILD_CATEGORY" && !c.parent);
			let channels, pos = 0;
			if (uncategorized.has(channel.id)) {
				channels = [...uncategorized.values()].sort((a, b) => a.position - b.position);
			} else {
				const categoryID = channel.type == "GUILD_CATEGORY" ? channel.id : channel.parent.id,
					categoryChannels = ctx.interaction.guild.channels.cache.filter(c => c.type == "GUILD_CATEGORY")
						.sort((a, b) => a.position - b.position);
				pos += uncategorized.size + 1;

				let categoryParent = categoryChannels[0], i = 0;
				while (categoryParent.id != categoryID) {
					pos += categoryParent.children.size + 1;
					i++;
					categoryParent = categoryChannels[i];
				}
				channels = [...categoryParent.children.values()].sort((a, b) => a.position - b.position);
			}
			if (channel.type != "GUILD_CATEGORY") {
				const textChannels = channels.filter(c => c.type == "GUILD_TEXT");
				if (channel.type == "GUILD_TEXT") {
					pos += textChannels.findIndex(c => c.id == channel.id);
				} else {
					const voiceChannels = channels.filter(c => c.type == "GUILD_VOICE");
					pos += textChannels.length + voiceChannels.findIndex(c => c.id == channel.id);
				}
				pos++;
			}
			channelEmbed.addField("Position", pos + " / " + ctx.interaction.guild.channels.cache.size, true);

			if (channel.type == "GUILD_TEXT") {
				channelEmbed.addField("NSFW", channel.nsfw ? "Yes" : "No", true)
					.addField("Topic", channel.topic || "No topic set");
			} else if (channel.type == "GUILD_VOICE") {
				channelEmbed.addField("User Limit", channel.userLimit == 0 ? "None" : channel.userLimit, true)
					.addField("Bitrate", channel.bitrate + " bits", true);
			}

			ctx.respond(channelEmbed);
		}
	},
	class CreateChannelSubcommand extends Command {
		constructor() {
			super({
				name: "create",
				description: "Create a text channel",
				args: [
					{
						name: "name",
						description: "Name of the new channel",
						type: "string",
						required: true
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_CHANNELS"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				}
			});
		}

		async run(ctx) {
			if (ctx.interaction.guild.channels.cache.size >= 500) return ctx.respond("Cannot create channel since limit of 500 channels is reached.", {level: "warning"});

			const channelName = ctx.parsedArgs["name"].toLowerCase();
			ctx.interaction.guild.channels.create(channelName, {type: "GUILD_TEXT"})
				.then(() => ctx.respond(`✅ The text channel **${channelName}** has been created.`))
				.catch(err => ctx.respond("An error has occurred while trying to create the channel: `" + err + "`"));
		}
	},
	class DeleteChannelSubcommand extends Command {
		constructor() {
			super({
				name: "delete",
				description: "Deletes a channel",
				args: [
					{
						name: "channel",
						description: "Channel to delete",
						type: "channel",
						required: true
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_CHANNELS"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				}
			});
		}

		async run(ctx) {
			const channel = ctx.parsedArgs["channel"];
			if (channel.createdTimestamp + 1.5552e+10 < Date.now()) {
				const promptRes = await promptor.prompt(ctx,
					`You are about to delete the channel **${channel.name}** (ID ${channel.id}), which is more than 180 days old.`);
				if (promptRes.error) return ctx.respond(promptRes.error, {level: "warning"});
			}

			channel.delete()
				.then(() => ctx.respond(`✅ The channel **${channel.name}** has been deleted.`))
				.catch(err => ctx.respond("An error has occurred while trying to delete the channel: `" + err + "`"));
		}
	},
	class RenameChannelSubcommand extends Command {
		constructor() {
			super({
				name: "rename",
				description: "Renames this channel",
				args: [
					{
						name: "name",
						description: "New name for this channel",
						type: "string",
						required: true
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_CHANNELS"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				}
			});
		}

		async run(ctx) {
			const newChannelName = ctx.parsedArgs["name"].toLowerCase();
			ctx.interaction.channel.setName(newChannelName)
				.then(() => ctx.respond(`✅ This channel's name has been set to **${newChannelName}**.`))
				.catch(err => ctx.respond("An error has occurred while trying to rename this channel: `" + err + "`"));
		}
	},
	class SetTopicSubcommand extends Command {
		constructor() {
			super({
				name: "settopic",
				description: "Sets this channel's topic",
				args: [
					{
						name: "topic",
						description: "New topic",
						type: "string",
						required: true
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_CHANNELS"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				}
			});
		}

		async run(ctx) {
			const newChannelTopic = ctx.parsedArgs["topic"];
			if (newChannelTopic.length > 1024) return ctx.respond("The topic to set is too long.", {level: "warning"});

			ctx.interaction.channel.setTopic(newChannelTopic)
				.then(() => ctx.respond("✅ This channel's topic has changed."))
				.catch(err => ctx.respond("An error has occurred while trying to set the topic: `" + err + "`"));
		}
	},
	class LockSubcommand extends Command {
		constructor() {
			super({
				name: "lock",
				description: "Lock a channel to @everyone",
				args: [
					{
						name: "channel",
						description: "Channel to lock",
						type: "channel",
						required: true
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_CHANNELS"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				}
			});
		}

		async run(ctx) {
			const rawChannel = ctx.parsedArgs["channel"],
				channel = rawChannel || ctx.interaction.channel,
				channelTarget = rawChannel ? "The channel **" + channel.name + "**": "This channel";
			const everyoneRoleID = ctx.interaction.guild.roles.everyone.id;

			const ecOverwrites = channel.permissionOverwrites.cache.get(everyoneRoleID);
			if (ecOverwrites && ecOverwrites.deny.has("VIEW_CHANNEL")) {
				return ctx.respond(channelTarget + " is already locked to the everyone role.", {level: "warning"});
			}
			channel.permissionOverwrites.create(everyoneRoleID, {
				VIEW_CHANNEL: false
			})
				.then(() => {
					ctx.respond(`✅ ${channelTarget} has been locked to the everyone role.`);
				})
				.catch(err => ctx.respond("An error has occurred while trying to lock the channel: `" + err + "`"));
		}
	},
	class UnlockSubcommand extends Command {
		constructor() {
			super({
				name: "unlock",
				description: "Unlock a channel to @everyone",
				args: [
					{
						name: "channel",
						description: "Channel to unlock",
						type: "channel",
						required: true
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_CHANNELS"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				},
				usage: "unlock [channel]"
			});
		}

		async run(ctx) {
			const rawChannel = ctx.parsedArgs["channel"],
				channel = rawChannel || ctx.interaction.channel,
				channelTarget = rawChannel ? "The channel **" + channel.name + "**": "This channel";
			const everyoneRoleID = ctx.interaction.guild.roles.everyone.id;

			const ecOverwrites = channel.permissionOverwrites.cache.get(everyoneRoleID);
			if (!ecOverwrites || !ecOverwrites.deny.has("VIEW_CHANNEL")) {
				return ctx.respond(channelTarget + " is not locked to the everyone role.", {level: "warning"});
			}
			channel.permissionOverwrites.edit(everyoneRoleID, {
				VIEW_CHANNEL: null
			})
				.then(() => {
					ctx.respond(`✅ ${channelTarget} has been unlocked to the everyone role.`);
				})
				.catch(err => ctx.respond("An error has occurred while trying to unlock the channel: `" + err + "`"));
		}
	}
];

class ChannelsCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "channels",
			description: "Server channel commands",
			subcommands: subcommands
		});
	}
}

module.exports = ChannelsCommandGroup;
