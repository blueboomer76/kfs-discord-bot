const Command = require("../structures/command.js");
const promptor = require("../modules/codePromptor.js");

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
						num: Infinity,
						type: "member"
					},
					{
						num: Infinity,
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
			let member = args[0], role = args[1];
			if (member.id == message.author.id || member.id == bot.user.id) return message.channel.send("This command cannot be used on yourself or the bot.");
			if (member.roles.get(role.id)) return message.channel.send("That user already has the role you provided.");
			if (message.author.id != message.guild.owner.id && role.comparePositionTo(message.member.highestRole) >= 0) {
				return message.channel.send("Cannot add role: your highest role must be higher than the role to add (overrides with server owner)");
			} else if (role.comparePositionTo(message.guild.me.highestRole) >= 0) {
				return message.channel.send("Cannot add role: the bot's highest role must be higher than the role to add");
			} else if (role.managed) {
				return message.channel.send("Integrated or managed roles cannot be added to a user.");
			}
	
			member.addRole(role)
			.then(() => message.channel.send(`✅ Role **${role.name}** has been added to the user **${member.user.tag}**.`))
			.catch(err => message.channel.send("An error has occurred while trying to add the role: `" + err + "`"))
		}
	},
	class BanCommand extends Command {
		constructor() {
			super({
				name: "ban",
				description: "Bans a user from this server",
				args: [
					{
						num: Infinity,
						type: "member"
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
							min: 0,
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
				usage: "ban <user> [--days <0-7>] [--reason <reason>]"
			});
		}
		
		async run(bot, message, args, flags) {
			let member = args[0],
				daysFlag = flags.find(f => f.name == "days"),
				reasonFlag = flags.find(f => f.name == "reason");
			if (member.id == message.author.id || member.id == message.guild.owner.id || member.id == bot.user.id) return message.channel.send("This command cannot be used on yourself, the server owner, or the bot.");
			if (message.author.id != message.guild.owner.id && member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
				return message.channel.send("Cannot ban: your highest role must be higher than the user's highest role (overrides with server owner)");
			} else if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) {
				return message.channel.send("Cannot ban: the bot's highest role must be higher than the user's highest role");
			}

			let cmdErr = await promptor.prompt(message, `You are about to ban the user **${member.user.tag}** from this server.`);
			if (cmdErr) return message.channel.send(cmdErr);

			member.ban({
				days: daysFlag ? daysFlag.args : 0,
				reason: reasonFlag ? reasonFlag.args : null
			})
			.then(() => message.channel.send(`✅ The user **${member.user.tag}** was banned from the server.`))
			.catch(err => message.channel.send("An error has occurred while trying to ban the user: `" + err + "`"))
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
						num: 1,
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
			let channelName = args[0].toLowerCase();
			message.guild.createChannel(channelName, {type: "text"})
			.then(() => message.channel.send(`✅ The text channel **${channelName}** has been created.`))
			.catch(err => message.channel.send("An error has occurred while trying to create the channel: `" + err + "`"))
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
						num: Infinity,
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
			let roleName = args[0];
			message.guild.createRole({name: roleName})
			.then(() => message.channel.send(`✅ Role **${roleName}** has been created.`))
			.catch(err => message.channel.send("An error has occurred while trying to create the role: `" + err + "`"))
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
						num: Infinity,
						type: "channel"
					},
				],
				cooldown: {
					time: 30000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_CHANNELS"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				},
				usage: "deletechannel <name>"
			});
		}
		
		async run(bot, message, args, flags) {
			let channel = args[0];
			let cmdErr = await promptor.prompt(message, `You are about to delete the channel **${channel.name}**, which is more than 180 days old.`)
			if (cmdErr) return message.channel.send(cmdErr);
			
			channel.delete()
			.then(() => message.channel.send(`✅ The channel **${channel.name}** has been deleted.`))
			.catch(err => message.channel.send("An error has occurred while trying to delete the channel: `" + err + "`"))
		}
	},
	class KickCommand extends Command {
		constructor() {
			super({
				name: "kick",
				description: "Kicks a user from this server",
				args: [
					{
						num: Infinity,
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
			let member = args[0],
				reasonFlag = flags.find(f => f.name == "reason");
			if (member.id == message.author.id || member.id == message.guild.owner.id || member.id == bot.user.id) return message.channel.send("This command cannot be used on yourself, the server owner, or the bot.");
			if (message.author.id != message.guild.owner.id && member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
				return message.channel.send("Cannot kick: your highest role must be higher than the user's highest role (overrides with server owner)");
			} else if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) {
				return message.channel.send("Cannot kick: the bot's highest role must be higher than the user's highest role");
			}

			let cmdErr = await promptor.prompt(message, `You are about to kick the user **${member.user.tag}** from this server.`)
			if (cmdErr) return message.channel.send(cmdErr);

			member.kick(reasonFlag ? reasonFlag.args : null)
			.then(() => message.channel.send(`✅ The user **${member.user.tag}** was kicked from the server.`))
			.catch(err => message.channel.send("An error has occurred while trying to kick the user: `" + err + "`"))
		}
	},
	class PurgeCommand extends Command {
		constructor() {
			super({
				name: "purge",
				description: "Deletes messages from this channel",
				aliases: ["clear", "prune"],
				args: [
					{
						num: 1,
						type: "number",
						min: 1,
						max: 99
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				flags: [
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
				usage: "purge <1-99> [--user <user>] [--text <text>] [--bots] [--embeds]"
			});
		}
		
		async run(bot, message, args, flags) {
			let errorStatus = false;
			let toDelete = args[0] + 1;
			if (flags.length > 0) {
				await message.channel.fetchMessages({"limit": args[0]})
				.then(messages => {
					toDelete = messages;
					for (let i = 0; i < flags.length; i++) {
						switch (flags[i].name) {
							case "bots":
								toDelete = toDelete.filter(msg => msg.author.bot);
								break;
							case "embeds":
								toDelete = toDelete.filter(msg => msg.embeds[0]);
								break;
							case "text":
								toDelete = toDelete.filter(msg => msg.content.toLowerCase().includes(flags[i].args.toLowerCase()));
								break;
							case "user":
								toDelete = toDelete.filter(msg => msg.author.id == flags[i].args.id);
						}
					}
					if (!toDelete.get(message.id)) {toDelete.set(message.id, message)};
				})
				.catch(err => {
					message.channel.send("Error occurred while trying to fetch messages: `" + err + "`")
					errorStatus = true;
				})
			}
			if (errorStatus) return;
			message.channel.bulkDelete(toDelete, true)
			.then(messages => {
				message.channel.send(`🗑 Deleted ${messages.size - 1} messages from the channel!`).then(m => m.delete(7500).catch(() => {}))
			})
			.catch(err => message.channel.send("An error has occurred while trying to purge the messages: `" + err + "`"))
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
						num: Infinity,
						type: "member"
					},
					{
						num: Infinity,
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
			let member = args[0], role = args[1];
			if (member.id == message.author.id || member.id == bot.user.id) return message.channel.send("This command cannot be used on yourself or the bot.");
			if (!member.roles.has(role.id)) return message.channel.send("The user does not have that role.");
			if (message.author.id != message.guild.owner.id && role.comparePositionTo(message.member.highestRole) >= 0) {
				return message.channel.send("Cannot remove role: your highest role must be higher than the role to remove (overrides with server owner)");
			} else if (role.comparePositionTo(message.guild.me.highestRole) >= 0) {
				return message.channel.send("Cannot remove role: the bot's highest role must be higher than the role to remove");
			} else if (role.managed) {
				return message.channel.send("Integrated or managed roles cannot be removed from a user.");
			}
	
			member.removeRole(role)
			.then(() => message.channel.send(`✅ Role **${role.name}** has been removed from the user **${member.user.tag}**.`))
			.catch(err => message.channel.send("An error has occurred while trying to remove the role: `" + err + "`"))
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
						num: Infinity,
						type: "member"
					},
					{
						num: Infinity,
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
			let member = args[0], newNick = args[1];
			if (member.id == message.author.id || member.id == message.guild.owner.id || member.id == bot.user.id) return message.channel.send("This command cannot be used on yourself, the server owner, or the bot.");
			if (message.author.id != message.guild.owner.id && member.highestRole.comparePositionTo(message.member.highestRole) >= 0) {
				return message.channel.send("Cannot set nickname: your highest role must be higher than the user's highest role (overrides with server owner)");
			} else if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) {
				return message.channel.send("Cannot set nickname: the bot's highest role must be higher than the user's highest role");
			}

			member.setNickname(newNick)
			.then(() => message.channel.send(`✅ Nickname of **${member.user.tag}** has been set to **${newNick}**.`))
			.catch(err => message.channel.send("An error has occurred while trying to set the nickname: `" + err + "`"))
		}
	}
]
