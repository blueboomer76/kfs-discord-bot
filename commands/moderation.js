const Discord = require("discord.js");
const Command = require("../structures/command.js");
const promptor = require("../modules/codePromptor.js");

module.exports = [
	class AddRoleCommand extends Command {
		constructor() {
			super({
				name: "addrole",
				description: "Adds a role to a user. It will be logged if a modlog channel was set",
				aliases: ["ar", "giverole", "setrole"],
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
				flags: [
					{
						name: "role",
						desc: "Role to give",
						arg: {
							num: 1,
							type: "role"
						}
					},
					{
						name: "user",
						desc: "User to give the role to",
						arg: {
							num: 1,
							type: "member"
						}
					}
				],
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
			if (role.comparePositionTo(message.guild.me.highestRole) >= 0) return message.channel.send("I cannot add that role because its position is at or higher than mine.")
			if (member.roles.has(role.id)) return message.channel.send("That member already has the role you provided.")
				
			await member.addRole(role)
			.then(message.channel.send(`✅ Role **${role.name}** has been added to **${member.user.tag}**.`))
			.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
		}
	},
	class BanCommand extends Command {
		constructor() {
			super({
				name: "ban",
				description: "Bans a user. It will be logged if a modlog channel was set",
				args: [
					{
						infiniteArgs: true,
						type: "member"
					},
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
							num: 1,
							type: "number",
							min: 0,
							max: 14
						}
					},
					{
						name: "reason",
						desc: "Reason to put in the audit log",
						arg: {
							num: 1,
							type: "string"
						}
					}
				],
				perms: {
					bot: ["BAN_MEMBERS"],
					user: ["BAN_MEMBERS"],
					level: 0
				},
				usage: "ban <user>"
			});
		}
		
		async run(bot, message, args, flags) {
			let member = args[0],
				daysFlag = flags.find(f => f.name == "days"),
				reasonFlag = flags.find(f => f.name == "reason"),
				cmdErr;
			if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) return message.channel.send("I cannot ban that member because their highest role is at or higher than mine.")
				
			cmdErr = await promptor.prompt(message, `You are about to ban the user **${args[0].user.tag}** from this guild.`);
			if (cmdErr) return message.channel.send(cmdErr);
			
			await member.ban({
				days: daysFlag ? daysFlag.args[0] : 0,
				reason: reasonFlag ? reasonFlag.args[0] : null
			})
			.then(message.channel.send(`✅ The user **${member.user.tag}** was banned from the guild.`))
			.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
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
			let channelNameRegex = /[^0-9a-z-_]+/
			if (channelNameRegex.test(args[0])) return message.channel.send("Channel names can only have numbers, lowercase letters, hyphens, or underscores.")
				
			await message.guild.createChannel(args[0])
			.then(channel => message.channel.send(`✅ The channel **${channel.name}** has been created.`))
			.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
		}
	},
	class CreateRoleCommand extends Command {
		constructor() {
			super({
				name: "createrole",
				description: "Creates a guild role. It will be logged if a modlog channel was set",
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
			await message.guild.createRole({name: args[0]})
			.then(role => message.channel.send(`✅ Role **${role.name}** has been created.`))
			.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
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
			if (args[0].createdTimestamp + 1.5552e+10 < Number(new Date())) {
				let cmdErr = await promptor.prompt(message, `You are about to delete the channel **${args[0].name}**, which is more than 180 days old.`)
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			await args[0].delete()
			.then(message.channel.send(`✅ The channel **${args[0].name}** has been deleted.`))
			.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
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
				perms: {
					bot: ["MANAGE_ROLES"],
					user: ["MANAGE_ROLES"],
					level: 0
				},
				usage: "deleterole <name>"
			});
		}
		
		async run(bot, message, args, flags) {
			if (args[0].members.size > 10 && args[0].members.size > message.guild.memberCount / 10) {
				let cmdErr = await promptor.prompt(message, `You are about to delete the role **${args[0].name}**, which more than 10% of the members in this server have.`)
				if (cmdErr) return message.channel.send(cmdErr);
			}
			
			await args[0].delete()
			.then(message.channel.send(`✅ The role **${args[0].name}** has been deleted.`))
			.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
		}
	},
	class KickCommand extends Command {
		constructor() {
			super({
				name: "kick",
				description: "Kicks a member. It will be logged if a modlog channel was set",
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
							num: 1,
							type: "string"
						}
					}
				],
				perms: {
					bot: ["KICK_MEMBERS"],
					user: ["KICK_MEMBERS"],
					level: 0
				},
				usage: "kick <user>"
			});
		}
		
		async run(bot, message, args, flags) {
			let member = args[0], reasonFlag = flags.find(f => f.name == "reason"),
				cmdErr;
			if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) return message.channel.send("I cannot kick that member because their highest role is at or higher than mine.")
			
			cmdErr = await promptor.prompt(message, `You are about to kick the user **${args[0].user.tag}** from this guild.`)
			
			if (cmdErr) return message.channel.send(cmdErr);
			
			await member.kick(reasonFlag ? reasonFlag.args[0] : null)
			.then(message.channel.send(`✅ The user **${member.user.tag}** was kicked from the guild.`))
			.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
		}
	},
	class PurgeCommand extends Command {
		constructor() {
			super({
				name: "purge",
				description: "Deletes messages from a channel",
				aliases: ["clear", "prune"],
				args: [
					{
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
							num: Infinity,
							type: "string"
						}
					},
					{
						name: "user",
						desc: "Messages from a user",
						arg: {
							num: 1,
							type: "member"
						}
					}
				],
				perms: {
					bot: ["MANAGE_MESSAGES"],
					user: ["MANAGE_MESSAGES"],
					level: 0
				},
				usage: "purge <1-99> [--user <user>] [--text <text>] [--attachments] [--bots] [--embeds]"
			});
		}
		
		async run(bot, message, args, flags) {
			let errorStatus = false;
			let toDelete = args[0] + 1;
			if (flags.length > 0) {
				await message.channel.fetchMessages({"limit": toDelete})
				.then(messages => {
					toDelete = messages;
					for (let i = 0; i < flags.length; i++) {
						switch (flags[i].name) {
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
								toDelete = toDelete.filter(msg => msg.content.includes(flags[i].args[0]));
								break;
							case "user":
								toDelete = toDelete.filter(msg => msg.member == flags[i].args[0]);
						}
					}
					if (!toDelete.get(message.id)) {toDelete.set(message.id, message)};
				})
				.catch(err => {
					message.channel.send("Error occurred while trying to fetch messages:```" + err + "```")
					errorStatus = true;
				})
			}
			if (errorStatus) return;
			await message.channel.bulkDelete(toDelete, true)
			.then(messages => {
				message.channel.send(`🗑 Deleted ${messages.size - 1} messages from this channel!`).then(m => m.delete(7500))
			})
			.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
		}
	},
	class RemoveRoleCommand extends Command {
		constructor() {
			super({
				name: "removerole",
				description: "Removes a role a user has. It will be logged if a modlog channel was set",
				aliases: ["rr", "takerole"],
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
				flags: [
					{
						name: "role",
						desc: "Role to remove",
						arg: {
							num: 1,
							type: "role"
						}
					},
					{
						name: "user",
						desc: "User to remove the role from",
						arg: {
							num: 1,
							type: "member"
						}
					}
				],
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
			if (!member.roles.has(args[1].id)) return message.channel.send("That member does not have the role you provided.");
			if (role.comparePositionTo(message.guild.me.highestRole) >= 0) return message.channel.send("I cannot remove that role because its position is at or higher than mine.")
				
			await member.removeRole(role)
			.then(message.channel.send(`✅ Role **${role.name}** has been removed from **${member.user.tag}**.`))
			.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
		}
	},
	class SetNicknameCommand extends Command {
		constructor() {
			super({
				name: "setnickname",
				description: "Changes a member's nickname. It will be logged if a modlog channel was set",
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
			let member = args[0];
			let newNick = args[1];
			await member.setNickname(newNick)
			.then(message.channel.send(`✅ Nickname of **${member.user.tag}** has been set to **${newNick}.**`))
			.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"))
		}
	}
]