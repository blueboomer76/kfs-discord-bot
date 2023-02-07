const {DiscordAPIError, Constants, Permissions} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	promptor = require("../../modules/codePromptor.js");

function compareRolePositions(interaction, target, role, options) {
	let err = "";
	if (options.type == "role") {
		const tempErr = `I cannot ${options.action} the role **${target.name}** since its position is at or higher than `;
		if (interaction.guild.ownerId != interaction.user.id && target.comparePositionTo(interaction.member.roles.highest) >= 0) {
			err = tempErr + "your highest role. This can be overridden with server owner.";
		} else if (!options.ignoreBot && target.comparePositionTo(interaction.guild.me.roles.highest) >= 0) {
			err = tempErr + "my highest role.";
		}
	} else {
		const tempErr = `I cannot ${options.action} the user **${target.user.tag}** since the user's highest role is at or higher than `;
		if (interaction.guild.ownerId != interaction.user.id && role.comparePositionTo(interaction.member.roles.highest) >= 0) {
			err = tempErr + "yours. This can be overridden with server owner.";
		} else if (!options.ignoreBot && role.comparePositionTo(interaction.guild.me.roles.highest) >= 0) {
			err = tempErr + "mine.";
		}
	}
	return err.length > 0 ? err : true;
}

const subcommands = [
	class KickSubcommand extends Command {
		constructor() {
			super({
				name: "kick",
				description: "Kick a user from this server",
				args: [
					{
						name: "user",
						description: "The user",
						type: "user",
						required: true
					},
					{
						name: "reason",
						description: "Audit log reason",
						type: "string"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["KICK_MEMBERS"],
					user: ["KICK_MEMBERS"],
					level: 0
				}
			});
		}

		async run(ctx) {
			const member = ctx.parsedArgs["user"];
			if (member.id == ctx.interaction.user.id || member.id == ctx.interaction.guild.ownerId || member.id == ctx.bot.user.id) {
				return ctx.respond("This command cannot be used on yourself, the server owner, or the bot.", {level: "warning"});
			}
			const compareTest = compareRolePositions(ctx.interaction, member, member.roles.highest, {action: "kick", type: "user"});
			if (compareTest != true) return ctx.respond(compareTest, {level: "warning"});

			const promptRes = await promptor.prompt(ctx, `You are about to kick the user **${member.user.tag}** from this server.`);
			if (promptRes.error) return ctx.respond(promptRes.error, {level: "warning"});

			member.kick(ctx.parsedArgs["reason"])
				.then(() => ctx.respond(`✅ User **${member.user.tag}** has been kicked from this server.`))
				.catch(err => ctx.respond("An error has occurred while trying to kick the user: `" + err + "`"));
		}
	},
	class BanSubcommand extends Command {
		constructor() {
			super({
				name: "ban",
				description: "Bans a user from this server",
				args: [
					{
						name: "user",
						description: "The user",
						type: "user",
						required: true
					},
					{
						name: "days",
						description: "Days of messages to delete",
						type: "integer",
						choices: [
							{name: "None", value: 0},
							{name: "1 Day", value: 1},
							{name: "2 Days", value: 2},
							{name: "3 Days", value: 3},
							{name: "4 Days", value: 4},
							{name: "5 Days", value: 5},
							{name: "6 Days", value: 6},
							{name: "7 Days", value: 7}
						]
					},
					{
						name: "reason",
						description: "Audit log reason",
						type: "string"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["BAN_MEMBERS"],
					user: ["BAN_MEMBERS"],
					level: 0
				}
			});
		}

		async run(ctx) {
			const member = ctx.parsedArgs["user"];
			if (member.id == ctx.interaction.user.id || member.id == ctx.interaction.guild.ownerId || member.id == ctx.bot.user.id) {
				return ctx.respond("This command cannot be used on yourself, the server owner, or the bot.", {level: "warning"});
			}
			const compareTest = compareRolePositions(ctx.interaction, member, member.roles.highest, {action: "ban", type: "user"});
			if (compareTest != true) return ctx.respond(compareTest, {level: "warning"});

			const promptRes = await promptor.prompt(ctx, `You are about to ban the user **${member.user.tag}** from this server.`);
			if (promptRes.error) return ctx.respond(promptRes.error, {level: "warning"});

			member.ban({days: ctx.parsedArgs["days"] || 0, reason: ctx.parsedArgs["reason"]})
				.then(() => ctx.respond(`✅ User **${member.user.tag}** has been banned from this server.`))
				.catch(err => ctx.respond("An error has occurred while trying to ban the user: `" + err + "`"));
		}
	},
	class UnbanSubcommand extends Command {
		constructor() {
			super({
				name: "unban",
				description: "Unban a previously banned user",
				args: [
					{
						name: "user_id",
						description: "The user ID",
						type: "string",
						required: true,
						parsedType: "function",
						parsedTypeParams: {testFunction: obj => /^\d{17,19}$/.test(obj)},
						errorMsg: "You need to provide a valid user ID."
					},
					{
						name: "reason",
						description: "Audit log reason",
						type: "string"
					}
				],
				cooldown: {
					time: 25000,
					type: "user"
				},
				perms: {
					bot: ["BAN_MEMBERS"],
					user: ["BAN_MEMBERS"],
					level: 0
				}
			});
		}

		async run(ctx) {
			const userID = ctx.parsedArgs["user_id"];
			if (userID == ctx.interaction.user.id || userID == ctx.interaction.guild.ownerId || userID == ctx.bot.user.id) {
				return ctx.respond("This command cannot be used on yourself, the server owner, or the bot.", {level: "warning"});
			}

			ctx.interaction.guild.members.unban(userID, {reason: ctx.parsedArgs["reason"]})
				.then(() => ctx.respond(`✅ User with ID **${userID}** has been unbanned from this server.`))
				.catch(() => ctx.respond("Could not unban the user with that ID. " +
					"Make sure to check for typos in the ID and that the user is in the ban list."));
		}
	},
	class HackbanSubcommand extends Command {
		constructor() {
			super({
				name: "hackban",
				description: "Bans a user even if not in this server",
				args: [
					{
						name: "user_id",
						description: "The user ID",
						type: "string",
						required: true,
						parsedType: "function",
						parsedTypeParams: {testFunction: obj => /^\d{17,19}$/.test(obj)},
						errorMsg: "You need to provide a valid user ID."
					},
					{
						name: "days",
						description: "Days of messages to delete",
						type: "integer",
						choices: [
							{name: "None", value: 0},
							{name: "1 Day", value: 1},
							{name: "2 Days", value: 2},
							{name: "3 Days", value: 3},
							{name: "4 Days", value: 4},
							{name: "5 Days", value: 5},
							{name: "6 Days", value: 6},
							{name: "7 Days", value: 7}
						]
					},
					{
						name: "reason",
						description: "Audit log reason",
						type: "string"
					}
				],
				cooldown: {
					time: 25000,
					type: "user"
				},
				perms: {
					bot: ["BAN_MEMBERS"],
					user: ["BAN_MEMBERS"],
					level: 0
				}
			});
		}

		async run(ctx) {
			const userID = ctx.parsedArgs["user_id"];
			if (userID == ctx.interaction.user.id || userID == ctx.interaction.guild.ownerId || userID == ctx.bot.user.id) {
				return ctx.respond("This command cannot be used on yourself, the server owner, or the bot.", {level: "warning"});
			}

			await ctx.interaction.deferReply();

			let memberWithID, userWithID;
			await ctx.interaction.guild.members.fetch(userID)
				.then(member => {
					memberWithID = member;
					userWithID = member.user;
				})
				.catch(async err => {
					if (err instanceof DiscordAPIError) {
						if (err.code == Constants.APIErrors.UNKNOWN_MEMBER) {
							userWithID = await ctx.bot.users.fetch(userID).catch(() => undefined);
						} else if (err.code == Constants.APIErrors.UNKNOWN_USER) {
							userWithID = null;
						}
					}
				});

			if (userWithID == undefined) {
				return ctx.respond("Unable to perform a hackban. Maybe try again?", {level: "warning"});
			} else if (userWithID == null) {
				return ctx.respond("No user with ID `" + userID + "` found!", {level: "warning"});
			} else if (memberWithID) {
				const compareTest = compareRolePositions(ctx.interaction, memberWithID, memberWithID.roles.highest, {action: "hackban", type: "user"});
				if (compareTest != true) return ctx.respond(compareTest, {level: "warning"});
			}

			ctx.interaction.guild.members.ban(userID, {
				days: ctx.parsedArgs["days"] || 0,
				reason: ctx.parsedArgs["reason"]
			})
				.then(() => ctx.respond(`✅ User with ID **${userID}** has been hackbanned from this server.`))
				.catch(() => ctx.respond("Could not hackban the user with that ID. " +
					"Make sure to check for typos in the ID and that the user is not already banned."));
		}
	},
	class SoftbanSubcommand extends Command {
		constructor() {
			super({
				name: "softban",
				description: "Kick a user and delete messages",
				args: [
					{
						name: "user",
						description: "The user",
						type: "user",
						required: true
					},
					{
						name: "days",
						description: "Days of messages to delete",
						fullDescription: "This subcommand requires you to provide a number of days to delete messages. " +
							"Use `/moderation ban` without the `days` option instead if you do not want to delete any messages, " +
							"or `/moderation kick` to simply remove the user.",
						type: "integer",
						choices: [
							{name: "1 Day", value: 1},
							{name: "2 Days", value: 2},
							{name: "3 Days", value: 3},
							{name: "4 Days", value: 4},
							{name: "5 Days", value: 5},
							{name: "6 Days", value: 6},
							{name: "7 Days", value: 7}
						]
					},
					{
						name: "reason",
						description: "Audit log reason",
						type: "string"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["BAN_MEMBERS"],
					user: ["BAN_MEMBERS"],
					level: 0
				}
			});
		}

		async run(ctx) {
			const member = ctx.parsedArgs["user"];
			if (member.id == ctx.interaction.user.id || member.id == ctx.interaction.guild.ownerId || member.id == ctx.bot.user.id) {
				return ctx.respond("This command cannot be used on yourself, the server owner, or the bot.", {level: "warning"});
			}
			const compareTest = compareRolePositions(ctx.interaction, member, member.roles.highest, {action: "softban", type: "user"});
			if (compareTest != true) return ctx.respond(compareTest, {level: "warning"});

			const promptRes = await promptor.prompt(ctx, `You are about to softban the user **${member.user.tag}** in this server.`);
			if (promptRes.error) return ctx.respond(promptRes.error, {level: "warning"});

			member.ban({
				days: ctx.parsedArgs["days"] || 0,
				reason: ctx.parsedArgs["reason"]
			})
				.then(() => {
					ctx.interaction.guild.members.unban(member.id)
						.then(() => ctx.respond(`✅ User **${member.user.tag}** has been softbanned.`))
						.catch(() => ctx.respond("An error has occurred while trying to unban the user while softbanning."));
				})
				.catch(err => ctx.respond("An error has occurred while trying to ban the user while softbanning: " + err + ""));
		}
	},
	class MuteSubcommand extends Command {
		constructor() {
			super({
				name: "mute",
				description: "Prevent a user from sending messages",
				args: [
					{
						name: "user",
						description: "The user",
						type: "user",
						required: true
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_ROLES"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				}
			});
		}

		async run(ctx) {
			const member = ctx.parsedArgs["user"];
			if (member.id == ctx.interaction.user.id || member.id == ctx.interaction.guild.ownerId || member.id == ctx.bot.user.id) {
				return ctx.respond("This command cannot be used on yourself, the server owner, or the bot.", {level: "warning"});
			}
			if (member.hasPermission("ADMINISTRATOR")) return ctx.respond("This command cannot be used on members with the `Administrator` permission.", {level: "warning"});
			const compareTest = compareRolePositions(ctx.interaction, member, member.roles.highest, {action: "mute", type: "user", ignoreBot: true});
			if (compareTest != true) return ctx.respond(compareTest, {level: "warning"});

			const mcOverwrites = ctx.interaction.channel.permissionOverwrites.cache.get(member.id);
			if (mcOverwrites && new Permissions(mcOverwrites.deny).has("SEND_MESSAGES")) {
				return ctx.respond(`**${member.user.tag}** is already muted in this channel.`, {level: "warning"});
			}
			ctx.interaction.channel.permissionOverwrites.create(member, {
				SEND_MESSAGES: false
			})
				.then(channel => {
					let toSend = `✅ User **${member.user.tag}** has been muted in this channel.`;
					if (!channel.permissionsFor(member).has("VIEW_CHANNEL")) {
						toSend += "\n" + "*This user is also unable to view this channel.*";
					}
					ctx.respond(toSend);
				})
				.catch(err => ctx.respond("An error has occurred while trying to mute the user: `" + err + "`"));
		}
	},
	class UnmuteSubcommand extends Command {
		constructor() {
			super({
				name: "unmute",
				description: "Allow a muted user to send messages",
				args: [
					{
						name: "user",
						description: "The user",
						type: "user",
						required: true
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_ROLES"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				}
			});
		}

		async run(ctx) {
			const member = ctx.parsedArgs["user"];
			if (member.id == ctx.interaction.user.id || member.id == ctx.interaction.guild.ownerId || member.id == ctx.bot.user.id) {
				return ctx.respond("This command cannot be used on yourself, the server owner, or the bot.", {level: "warning"});
			}
			if (member.hasPermission("ADMINISTRATOR")) return ctx.respond("This command cannot be used on members with the `Administrator` permission.", {level: "warning"});
			const compareTest = compareRolePositions(ctx.interaction, member, member.roles.highest, {action: "unmute", type: "user", ignoreBot: true});
			if (compareTest != true) return ctx.respond(compareTest, {level: "warning"});

			const mcOverwrites = ctx.interaction.channel.permissionOverwrites.cache.get(member.id);
			if (!mcOverwrites || !mcOverwrites.deny.has("SEND_MESSAGES")) {
				return ctx.respond(`**${member.user.tag}** is not muted in this channel.`, {level: "warning"});
			}
			ctx.interaction.channel.permissionOverwrites.edit(member, {
				SEND_MESSAGES: null
			})
				.then(channel => {
					let toSend = `✅ User **${member.user.tag}** has been unmuted in this channel.`;
					if (!channel.permissionsFor(member).has("VIEW_CHANNEL")) {
						toSend += "\n*This user is still unable to view this channel.*";
					}
					ctx.respond(toSend);
				})
				.catch(err => ctx.respond("An error has occurred while trying to unmute the user: `" + err + "`"));
		}
	},
	class SetNicknameSubcommand extends Command {
		constructor() {
			super({
				name: "setnickname",
				description: "Change a user's nickname",
				args: [
					{
						name: "user",
						description: "The user",
						type: "user",
						required: true
					},
					{
						name: "nickname",
						description: "New nickname for the user",
						type: "string",
						required: true
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_NICKNAMES"],
					user: ["MANAGE_NICKNAMES"],
					level: 0
				}
			});
		}

		async run(ctx) {
			const member = ctx.parsedArgs["user"],
				newNick = ctx.parsedArgs["nickname"];
			if (member.id == ctx.interaction.user.id || member.id == ctx.interaction.guild.ownerId || member.id == ctx.bot.user.id) {
				return ctx.respond("This command cannot be used on yourself, the server owner, or the bot.", {level: "warning"});
			}
			if (newNick == member.user.username) return ctx.respond("The new nickname cannot be the same as the user's username.", {level: "warning"});
			if (newNick == member.nickname) return ctx.respond("The new nickname cannot be the same as the user's nickname in this server.", {level: "warning"});

			const compareTest = compareRolePositions(ctx.interaction, member, member.roles.highest, {action: "set the nickname of", type: "user"});
			if (compareTest != true) return ctx.respond(compareTest, {level: "warning"});

			member.setNickname(newNick)
				.then(() => ctx.respond(`✅ Nickname of user **${member.user.tag}** has been set to **${newNick}.**`))
				.catch(err => ctx.respond("An error has occurred while trying to set the nickname: `" + err + "`"));
		}
	},
	class ResetNicknameSubcommand extends Command {
		constructor() {
			super({
				name: "resetnickname",
				description: "Remove a user's nickname",
				args: [
					{
						name: "user",
						description: "The user",
						type: "user",
						required: true
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_NICKNAMES"],
					user: ["MANAGE_NICKNAMES"],
					level: 0
				}
			});
		}

		async run(ctx) {
			const member = ctx.parsedArgs["user"];
			if (member.id == ctx.interaction.user.id || member.id == ctx.interaction.guild.ownerId || member.id == ctx.bot.user.id) {
				return ctx.respond("This command cannot be used on yourself, the server owner, or the bot.", {level: "warning"});
			}
			if (!member.nickname) return ctx.respond(`User **${member.user.tag}** does not have a nickname in this server.`, {level: "warning"});
			const compareTest = compareRolePositions(ctx.interaction, member, member.roles.highest, {action: "reset the nickname of", type: "user"});
			if (compareTest != true) return ctx.respond(compareTest, {level: "warning"});

			member.setNickname("")
				.then(() => ctx.respond(`✅ Nickname of **${member.user.tag}** has been reset.`))
				.catch(err => ctx.respond("An error has occurred while trying to reset the nickname: `" + err + "`"));
		}
	}
];

class ModerationCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "moderation",
			description: "User management commands",
			subcommands: subcommands
		});
	}
}

module.exports = ModerationCommandGroup;
