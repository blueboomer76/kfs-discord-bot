const Command = require("../structures/command.js"),
	promptor = require("../modules/codePromptor.js");

module.exports = [
	class AddRoleCommand extends Command {
		constructor() {
			super({
				name: "addrole",
				description: "Adds a role to a user",
				aliases: ["giverole", "setrole"],
				args: [
					{
						allowQuotes: true,
						infiniteArgs: true,
						type: "member"
					},
					{
						infiniteArgs: true,
						type: "role"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_ROLES"],
					user: ["MANAGE_ROLES"],
					level: 0
				},
				usage: "addrole <user> <role>"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0], role = args[1];
			if (member.id == message.author.id || member.id == bot.user.id) return {cmdWarn: "This command cannot be used on yourself or the bot."};
			if (member.roles.has(role.id)) return {cmdWarn: `That user already has the role **${role.name}**.`};
			if (message.author.id != message.guild.owner.id && role.comparePositionTo(message.member.highestRole) >= 0) {
				return {cmdWarn: `Role **${role.name}** cannot be added to **${member.user.tag}** since its position is at or higher than yours (overrides with server owner)`};
			} else if (role.comparePositionTo(message.guild.me.highestRole) >= 0) {
				return {cmdWarn: `I cannot add the role **${role.name}** to **${member.user.tag}** since its position is at or higher than mine.`};
			} else if (role.managed) {
				return {cmdWarn: `Role **${role.name}** cannot be added to **${member.user.tag}** since it is managed or integrated.`};
			}
	
			member.addRole(role)
				.then(() => message.channel.send(`✅ Role **${role.name}** has been added to the user **${member.user.tag}**.`))
				.catch(err => message.channel.send("An error has occurred while trying to add the role: `" + err + "`"));
		}
	},
	class BanCommand extends Command {
		constructor() {
			super({
				name: "ban",
				description: "Bans a user from this server",
				args: [
					{
						infiniteArgs: true,
						type: "member"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				flags: [
					{
						name: "days",
						desc: "Number of days to delete messages",
						arg: {
							type: "number",
							min: 1,
							max: 7
						}
					},
					{
						name: "reason",
						desc: "Reason to put in the audit log",
						arg: {
							type: "string"
						}
					},
					{
						name: "yes",
						desc: "Skips the confirmation dialog"
					}
				],
				perms: {
					bot: ["BAN_MEMBERS"],
					user: ["BAN_MEMBERS"],
					level: 0
				},
				usage: "ban <user> [--days <1-7>] [--reason <reason>] [--yes]"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0],
				daysFlag = flags.find(f => f.name == "days"),
				reasonFlag = flags.find(f => f.name == "reason");
			if (member.id == message.author.id || member.id == message.guild.owner.id || member.id == bot.user.id) return {cmdWarn: "This command cannot be used on yourself, the server owner, or the bot."};
			if (message.author.id != message.guild.owner.id && member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
				return {cmdWarn: `User **${member.user.tag}** cannot be banned since their highest role is at or higher than yours (overrides with server owner)`};
			} else if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) {
				return {cmdWarn: `I cannot ban the user **${member.user.tag}** since their highest role is at or higher than mine.`};
			}

			if (!flags.some(f => f.name == "yes")) {
				const promptRes = await promptor.prompt(message, `You are about to ban the user **${member.user.tag}** from this server.`);
				if (promptRes) return {cmdWarn: promptRes};
			}

			member.ban({
				days: daysFlag ? daysFlag.args : 0,
				reason: reasonFlag ? reasonFlag.args : null
			})
				.then(() => message.channel.send(`✅ The user **${member.user.tag}** was banned from the server.`))
				.catch(err => message.channel.send("An error has occurred while trying to ban the user: `" + err + "`"));
		}
	},
	class CreateChannelCommand extends Command {
		constructor() {
			super({
				name: "createchannel",
				description: "Create a text channel with a given name",
				aliases: ["addch", "addchannel", "createch"],
				args: [
					{
						type: "string"
					},
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
				usage: "createchannel <name>"
			});
		}
		
		async run(bot, message, args, flags) {
			const channelName = args[0].toLowerCase();
			message.guild.createChannel(channelName, {type: "text"})
				.then(() => message.channel.send(`✅ The text channel **${channelName}** has been created.`))
				.catch(err => message.channel.send("An error has occurred while trying to create the channel: `" + err + "`"));
		}
	},
	class CreateRoleCommand extends Command {
		constructor() {
			super({
				name: "createrole",
				description: "Creates a server role",
				aliases: ["crrole"],
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_ROLES"],
					user: ["MANAGE_ROLES"],
					level: 0
				},
				usage: "createrole <name>"
			});
		}
		
		async run(bot, message, args, flags) {
			const roleName = args[0];
			message.guild.createRole({name: roleName})
				.then(() => message.channel.send(`✅ Role **${roleName}** has been created.`))
				.catch(err => message.channel.send("An error has occurred while trying to create the role: `" + err + "`"));
		}
	},
	class DeleteChannelCommand extends Command {
		constructor() {
			super({
				name: "deletechannel",
				description: "Deletes a channel",
				aliases: ["delch", "delchannel", "deletech"],
				args: [
					{
						infiniteArgs: true,
						type: "channel"
					},
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				flags: [
					{
						name: "yes",
						desc: "Skips the confirmation dialog"
					}
				],
				perms: {
					bot: ["MANAGE_CHANNELS"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				},
				usage: "deletechannel <name> [--yes]"
			});
		}
		
		async run(bot, message, args, flags) {
			const channel = args[0];
			if (channel.createdTimestamp + 1.5552e+10 < Number(new Date()) && !flags.some(f => f.name == "yes")) {
				const promptRes = await promptor.prompt(message, `You are about to delete the channel **${channel.name}** (ID ${channel.id}), which is more than 180 days old.`);
				if (promptRes) return {cmdWarn: promptRes};
			}
			
			channel.delete()
				.then(() => message.channel.send(`✅ The channel **${channel.name}** has been deleted.`))
				.catch(err => message.channel.send("An error has occurred while trying to delete the channel: `" + err + "`"));
		}
	},
	class DeleteRoleCommand extends Command {
		constructor() {
			super({
				name: "deleterole",
				description: "Deletes a role",
				aliases: ["delr", "delrole", "deleter"],
				args: [
					{
						infiniteArgs: true,
						type: "role"
					},
				],
				cooldown: {
					time: 30000,
					type: "user"
				},
				flags: [
					{
						name: "yes",
						desc: "Skips the confirmation dialog"
					}
				],
				perms: {
					bot: ["MANAGE_ROLES"],
					user: ["MANAGE_ROLES"],
					level: 0
				},
				usage: "deleterole <name>"
			});
		}

		async run(bot, message, args, flags) {
			const role = args[0];
			if (message.author.id != message.guild.owner.id && role.comparePositionTo(message.member.highestRole) >= 0) {
				return {cmdWarn: `Role **${role.name}** cannot be deleted since its position is at or higher than yours (overrides with server owner)`};
			} else if (role.comparePositionTo(message.guild.me.highestRole) >= 0) {
				return {cmdWarn: `I cannot delete the role **${role.name}** since its position is at or higher than mine.`};
			} else if (role.managed) {
				return {cmdWarn: `Role **${role.name}** cannot be deleted since it is managed or integrated.`};
			}

			if (role.members.size > 10 && role.members.size > message.guild.memberCount / 10 && !flags.some(f => f.name == "yes")) {
				const promptRes = await promptor.prompt(message, `You are about to delete the role **${role.name}** (ID ${role.id}), which more than 10% of the members in this server have.`);
				if (promptRes) return {cmdWarn: promptRes};
			}

			role.delete()
				.then(() => message.channel.send(`✅ The role **${role.name}** has been deleted.`))
				.catch(err => message.channel.send("An error has occurred while trying to delete the role: `" + err + "`"));
		}
	},
	class HackbanCommand extends Command {
		constructor() {
			super({
				name: "hackban",
				description: "Bans a user even if that user is not in this server",
				args: [
					{
						errorMsg: "You need to provide a valid user ID.",
						type: "function",
						testFunction: obj => /^\d{17,19}$/.test(obj)
					}
				],
				cooldown: {
					time: 25000,
					type: "user"
				},
				flags: [
					{
						name: "days",
						desc: "Number of days to delete messages",
						arg: {
							type: "number",
							min: 1,
							max: 7
						}
					},
					{
						name: "reason",
						desc: "Reason to put in the audit log",
						arg: {
							type: "string"
						}
					}
				],
				perms: {
					bot: ["BAN_MEMBERS"],
					user: ["BAN_MEMBERS"],
					level: 0
				},
				usage: "hackban <user ID> [--days <1-7>] [--reason <reason>]"
			});
		}

		async run(bot, message, args, flags) {
			const userID = args[0],
				daysFlag = flags.find(f => f.name == "days"),
				reasonFlag = flags.find(f => f.name == "reason");
			if (userID == message.author.id || userID == message.guild.owner.id || userID == bot.user.id) return {cmdWarn: "This command cannot be used on yourself, the server owner, or the bot."};
			let guildMembers, cmdErr;
			if (!message.guild.large) {
				guildMembers = message.guild.members;
			} else {
				await message.guild.fetchMembers()
					.then(g => guildMembers = g.members)
					.catch(err => cmdErr = `Failed to fetch members: ${err}`);
			}
			if (cmdErr) return {cmdWarn: cmdErr};

			const memberWithID = guildMembers.get(userID);
			if (memberWithID) {
				if (message.author.id != message.guild.owner.id && memberWithID.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
					return {cmdWarn: `User **${memberWithID.user.tag}** cannot be hackbanned since their highest role is at or higher than yours (overrides with server owner)`};
				} else if (memberWithID.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) {
					return {cmdWarn: `I cannot hackban the user **${memberWithID.user.tag}** since their highest role is at or higher than mine.`};
				}
			}

			message.guild.ban(userID, {
				days: daysFlag ? daysFlag.args : 0,
				reason: reasonFlag ? reasonFlag.args : null
			})
				.then(() => message.channel.send(`✅ The user with ID **${userID}** was hackbanned from the server.`))
				.catch(() => message.channel.send("Could not hackban the user with that ID. Make sure to check for typos in the ID and that the user is not already banned."));
		}
	},
	class KickCommand extends Command {
		constructor() {
			super({
				name: "kick",
				description: "Kicks a user from this server",
				args: [
					{
						infiniteArgs: true,
						type: "member"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				flags: [
					{
						name: "reason",
						desc: "Reason to put in the audit log",
						arg: {
							type: "string"
						}
					}
				],
				perms: {
					bot: ["KICK_MEMBERS"],
					user: ["KICK_MEMBERS"],
					level: 0
				},
				usage: "kick <user> [--reason <reason>]"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0],
				reasonFlag = flags.find(f => f.name == "reason");
			if (member.id == message.author.id || member.id == message.guild.owner.id || member.id == bot.user.id) return {cmdWarn: "This command cannot be used on yourself, the server owner, or the bot."};
			if (message.author.id != message.guild.owner.id && member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
				return {cmdWarn: `User **${member.user.tag}** cannot be kicked since their highest role is at or higher than yours (overrides with server owner)`};
			} else if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) {
				return {cmdWarn: `I cannot kick the user **${member.user.tag}** since their highest role is at or higher than mine.`};
			}

			const promptRes = await promptor.prompt(message, `You are about to kick the user **${member.user.tag}** from this server.`);
			if (promptRes) return {cmdWarn: promptRes};

			member.kick(reasonFlag ? reasonFlag.args : null)
				.then(() => message.channel.send(`✅ The user **${member.user.tag}** was kicked from the server.`))
				.catch(err => message.channel.send("An error has occurred while trying to kick the user: `" + err + "`"));
		}
	},
	class PurgeCommand extends Command {
		constructor() {
			super({
				name: "purge",
				description: "Deletes messages from this channel. Flags cannot be used for deleting from more than 100 messages at a time",
				aliases: ["clear", "prune"],
				args: [
					{
						type: "number",
						min: 1,
						max: 500
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				flags: [
					{
						name: "attachments",
						desc: "Messages containing attachments"
					},
					{
						name: "bots",
						desc: "Messages from bots"
					},
					{
						name: "embeds",
						desc: "Messages containing embeds"
					},
					{
						name: "text",
						desc: "Messages containing given text",
						arg: {
							type: "string"
						}
					},
					{
						name: "user",
						desc: "Messages from a user",
						arg: {
							type: "member"
						}
					}
				],
				perms: {
					bot: ["MANAGE_MESSAGES"],
					user: ["MANAGE_MESSAGES"],
					level: 0
				},
				usage: "purge <1-500> OR purge <1-100> [--user <user>] [--text <text>] [--attachments] [--bots] [--embeds]"
			});
		}
		
		async run(bot, message, args, flags) {
			await message.delete().catch(() => {});

			const deleteLarge = args[0] > 100 ? true : false;
			let toDelete = args[0];

			if (flags.length > 0) {
				if (deleteLarge) return {cmdWarn: "Flags are not supported for deleting from more than 100 messages at a time."};
				let fetchErr;
				await message.channel.fetchMessages({limit: args[0]})
					.then(messages => {
						toDelete = messages;
						for (const flag of flags) {
							switch (flag.name) {
								case "attachments":
									toDelete = toDelete.filter(msg => msg.attachments.size > 0);
									break;
								case "bots":
									toDelete = toDelete.filter(msg => msg.author.bot);
									break;
								case "embeds":
									toDelete = toDelete.filter(msg => msg.embeds[0]);
									break;
								case "text":
									toDelete = toDelete.filter(msg => msg.content.toLowerCase().includes(flag.args.toLowerCase()));
									break;
								case "user":
									toDelete = toDelete.filter(msg => msg.author.id == flag.args.id);
							}
						}
						if (!toDelete.get(message.id)) toDelete.set(message.id, message);
					})
					.catch(err => fetchErr = err);
				if (fetchErr) {
					console.log(fetchErr);
					return {cmdWarn: "Failed to fetch messages"};
				}
			} else if (deleteLarge) {
				const promptRes = await promptor.prompt(message, `You are about to delete ${toDelete} messages from this channel.`);
				if (promptRes) return {cmdWarn: promptRes};

				toDelete += 2;
			}

			if (deleteLarge) {
				const iters = Math.ceil(args[0] / 100);
				let deleteCount = 0;
				for (let i = 0; i < iters; i++) {
					let deleteErr;
					await message.channel.bulkDelete(i == iters - 1 ? toDelete % 100 : 100, true)
						.then(messages => deleteCount += messages.size)
						.catch(err => deleteErr = "Could not delete all messages: ```" + err + "```");
					if (deleteErr) return {cmdWarn: deleteErr};
				}
				message.channel.send(`🗑 Deleted ${deleteCount} messages from this channel!`).then(m => m.delete(7500).catch(() => {}));
			} else {
				message.channel.bulkDelete(toDelete, true)
					.then(messages => {
						message.channel.send(`🗑 Deleted ${messages.size} messages from this channel!`).then(m => m.delete(7500).catch(() => {}));
					})
					.catch(err => message.channel.send("An error has occurred while trying to purge the messages: `" + err + "`"));
			}
		}
	},
	class RemoveRoleCommand extends Command {
		constructor() {
			super({
				name: "removerole",
				description: "Removes a role a user has",
				aliases: ["takerole"],
				args: [
					{
						allowQuotes: true,
						infiniteArgs: true,
						type: "member"
					},
					{
						infiniteArgs: true,
						type: "role"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_ROLES"],
					user: ["MANAGE_ROLES"],
					level: 0
				},
				usage: "removerole <user> <role>"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0], role = args[1];
			if (member.id == message.author.id || member.id == bot.user.id) return {cmdWarn: "This command cannot be used on yourself or the bot."};
			if (!member.roles.has(role.id)) return {cmdWarn: `**${member.user.tag}** does not have a role named **${role.name}**.`};
			if (message.author.id != message.guild.owner.id && role.comparePositionTo(message.member.highestRole) >= 0) {
				return {cmdWarn: `Role **${role.name}** cannot be removed from **${member.user.tag}** since its position is at or higher than yours (overrides with server owner)`};
			} else if (role.comparePositionTo(message.guild.me.highestRole) >= 0) {
				return {cmdWarn: `I cannot remove the role **${role.name}** from **${member.user.tag}** since its position is at or higher than mine.`};
			} else if (role.managed) {
				return {cmdWarn: `Role **${role.name}** cannot be removed from **${member.user.tag}** since it is managed or integrated.`};
			}
	
			member.removeRole(role)
				.then(() => message.channel.send(`✅ Role **${role.name}** has been removed from the user **${member.user.tag}**.`))
				.catch(err => message.channel.send("An error has occurred while trying to remove the role: `" + err + "`"));
		}
	},
	class RenameChannelCommand extends Command {
		constructor() {
			super({
				name: "renamechannel",
				description: "Renames this channel",
				aliases: ["rnch", "renamech", "setchname", "setchannelname"],
				args: [
					{
						type: "string"
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
				usage: "renamechannel <name>"
			});
		}

		async run(bot, message, args, flags) {
			const newChannelName = args[0].toLowerCase();
			message.channel.setName(newChannelName)
				.then(() => message.channel.send(`✅ This channel's name has been set to **${newChannelName}**.`))
				.catch(err => message.channel.send("An error has occurred while trying to rename this channel: `" + err + "`"));
		}
	},
	class ResetNicknameCommand extends Command {
		constructor() {
			super({
				name: "resetnickname",
				description: "Remove a user's nickname",
				aliases: ["removenick", "removenickname", "resetnick"],
				args: [
					{
						infiniteArgs: true,
						type: "member"
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
				},
				usage: "resetnickname <user>"
			});
		}

		async run(bot, message, args, flags) {
			const member = args[0];
			if (member.id == message.author.id || member.id == message.guild.owner.id || member.id == bot.user.id) return {cmdWarn: "This command cannot be used on yourself, the server owner, or the bot."};
			if (!member.nickname) return {cmdWarn: `**${member.user.tag}** does not have a nickname in this server.`};
			if (message.author.id != message.guild.owner.id && member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
				return {cmdWarn: `Nickname of **${member.user.tag}** cannot be reset since their highest role is at or higher than yours (overrides with server owner)`};
			} else if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) {
				return {cmdWarn: `I cannot reset the nickname of **${member.user.tag}** since their highest role is at or higher than mine.`};
			}

			member.setNickname("")
				.then(() => message.channel.send(`✅ Nickname of **${member.user.tag}** has been reset.`))
				.catch(err => message.channel.send("An error has occurred while trying to reset the nickname: `" + err + "`"));
		}
	},
	class SetNicknameCommand extends Command {
		constructor() {
			super({
				name: "setnickname",
				description: "Changes a user's nickname in this server",
				aliases: ["changenick", "setnick"],
				args: [
					{
						allowQuotes: true,
						infiniteArgs: true,
						type: "member"
					},
					{
						infiniteArgs: true,
						type: "string"
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
				},
				usage: "setnickname <user> <new nick>"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0], newNick = args[1];
			if (member.id == message.author.id || member.id == message.guild.owner.id || member.id == bot.user.id) return {cmdWarn: "This command cannot be used on yourself, the server owner, or the bot."};
			if (message.author.id != message.guild.owner.id && member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
				return {cmdWarn: `Nickname of **${member.user.tag}** cannot be set since their highest role is at or higher than yours (overrides with server owner)`};
			} else if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) {
				return {cmdWarn: `I cannot set the nickname of **${member.user.tag}** since their highest role is at or higher than mine.`};
			}

			member.setNickname(newNick)
				.then(() => message.channel.send(`✅ Nickname of **${member.user.tag}** has been set to **${newNick}**.`))
				.catch(err => message.channel.send("An error has occurred while trying to set the nickname: `" + err + "`"));
		}
	},
	class UnbanCommand extends Command {
		constructor() {
			super({
				name: "unban",
				description: "Unbans a user",
				args: [
					{
						errorMsg: "You need to provide a valid user ID.",
						type: "function",
						testFunction: obj => /^\d{17,19}$/.test(obj)
					}
				],
				cooldown: {
					time: 25000,
					type: "user"
				},
				flags: [
					{
						name: "reason",
						desc: "Reason to put in the audit log",
						arg: {
							type: "string"
						}
					}
				],
				perms: {
					bot: ["BAN_MEMBERS"],
					user: ["BAN_MEMBERS"],
					level: 0
				},
				usage: "unban <user ID> [--reason <reason>]"
			});
		}

		async run(bot, message, args, flags) {
			const userID = args[0],
				reasonFlag = flags.find(f => f.name == "reason");
			if (userID == message.author.id || userID == message.guild.owner.id || userID == bot.user.id) return {cmdWarn: "This command cannot be used on yourself, the server owner, or the bot."};

			message.guild.unban(userID, reasonFlag ? reasonFlag.args : null)
				.then(() => message.channel.send(`✅ The user with ID **${userID}** was unbanned from the server.`))
				.catch(() => message.channel.send("Could not unban the user with that ID. Make sure to check for typos in the ID and that the user is in the ban list."));
		}
	}
];
