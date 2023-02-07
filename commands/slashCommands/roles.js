const {MessageEmbed} = require("discord.js"),
	Command = require("../../structures/command.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	promptor = require("../../modules/codePromptor.js"),
	{getDateAndDurationString, getStatuses} = require("../../modules/functions.js"),
	{fetchMembers} = require("../../modules/memberFetcher.js"),
	Paginator = require("../../utils/paginator.js");

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
	class RoleInfoSubcommand extends Command {
		constructor() {
			super({
				name: "info",
				description: "Get role information",
				args: [
					{
						name: "role",
						description: "The role",
						type: "role",
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
			const role = ctx.parsedArgs["role"],
				rolePos = role.position,
				guildRoles = [...ctx.interaction.guild.roles.cache.values()];
			guildRoles.splice(guildRoles.findIndex(r => r.position == 0), 1);

			const nearbyRoles = [],
				startPos = Math.min(rolePos + 2, guildRoles.length),
				endPos = Math.max(rolePos - 2, 1);
			for (let i = startPos; i >= endPos; i--) {
				const roleName = guildRoles.find(r => r.position == i).name;
				nearbyRoles.push(i == rolePos ? `**${roleName}**` : roleName);
			}

			const roleInfoEmbed = new MessageEmbed()
				.setTitle("Role Info - " + role.name)
				.setColor(role.color)
				.setFooter({text: "ID: " + role.id})
				.addField("Role created at", getDateAndDurationString(role.createdTimestamp));

			if (ctx.bot.intents.has("GUILD_MEMBERS")) {
				const hasGuildPresencesIntent = ctx.bot.intents.has("GUILD_PRESENCES");
				const guildMembers = await fetchMembers(ctx, hasGuildPresencesIntent);
				const roleMembers = guildMembers.filter(mem => mem.roles.cache.has(role.id));

				roleInfoEmbed.addField(`Members in Role [${roleMembers.size} total]`,
					hasGuildPresencesIntent ? getStatuses(roleMembers).notOffline + " Online" :
						"No Additional Data Available", true);
			} else {
				roleInfoEmbed.addField("Members in Role", "No Data", true);
			}

			roleInfoEmbed
				.addField("Color", "Hex: " + role.hexColor + "\nDecimal: " + role.color, true)
				.addField("Position from top", (guildRoles.length - rolePos + 1) + " / " + guildRoles.length, true)
				.addField("Displays separately (hoisted)", role.hoist ? "Yes" : "No", true)
				.addField("Mentionable", role.mentionable ? "Yes" : "No", true)
				.addField("Managed", role.managed ? "Yes" : "No", true)
				.addField("Role order", nearbyRoles.join(" > "));

			ctx.respond(roleInfoEmbed);
		}
	},
	class RoleListSubcommand extends Command {
		constructor() {
			super({
				name: "list",
				description: "List this server's roles",
				args: [
					{
						name: "ordered",
						description: "Order roles by position",
						type: "boolean"
					}
				],
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
			const orderedFlag = ctx.parsedArgs["ordered"];
			const roles = [...ctx.interaction.guild.roles.cache.values()];
			roles.splice(roles.findIndex(r => r.position == 0), 1);
			if (orderedFlag) roles.sort((a, b) => b.position - a.position);
			new Paginator(ctx, [roles.map(role => role.name)], {title: "List of roles - " + ctx.interaction.guild.name}, {
				noStop: true,
				numbered: orderedFlag,
				page: 1,
				removeReactAfter: 60000
			}).start();
		}
	},
	class RoleMembersSubcommand extends Command {
		constructor() {
			super({
				name: "members",
				description: "See which members have a certain role",
				args: [
					{
						name: "role",
						description: "The role",
						type: "role",
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
			if (!ctx.bot.intents.has("GUILD_MEMBERS")) return ctx.respond("This command cannot be run since no data is available.", {level: "error"});

			const role = ctx.parsedArgs["role"],
				guildMembers = await fetchMembers(ctx),
				roleMembers = guildMembers.filter(mem => mem.roles.cache.has(role.id));

			if (roleMembers.size == 0) return ctx.respond(`There are no members in the role **${role.name}**.`, {level: "warning"});
			if (roleMembers.size > 250) return ctx.respond(`There are more than 250 members in the role **${role.name}**.`, {level: "warning"});

			new Paginator(ctx, [roleMembers.map(m => m.user.tag)], {title: "List of members in role - " + role.name}, {
				embedColor: role.color,
				noStop: true,
				removeReactAfter: 60000
			}).start();
		}
	},
	class AddRoleSubcommand extends Command {
		constructor() {
			super({
				name: "add",
				description: "Add a role to a user",
				args: [
					{
						name: "user",
						description: "The user",
						type: "user",
						required: true
					},
					{
						name: "role",
						description: "The role",
						type: "role",
						required: true
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
				}
			});
		}

		async run(ctx) {
			const member = ctx.parsedArgs["user"],
				role = ctx.parsedArgs["role"];
			if (member.id == ctx.interaction.user.id || member.id == ctx.bot.user.id) return ctx.respond("This command cannot be used on yourself or the bot.", {level: "warning"});
			if (member.roles.cache.has(role.id)) return ctx.respond(`User **${member.user.tag}** already has the role **${role.name}**.`, {level: "warning"});
			if (role.managed) return ctx.respond(`Role **${role.name}** cannot be added to **${member.user.tag}** since it is managed or integrated.`, {level: "warning"});
			const compareTest = compareRolePositions(ctx.interaction, member, role, {action: `add the role **${role.name}** to`, type: "user"});
			if (compareTest != true) return ctx.respond(compareTest, {level: "warning"});

			await ctx.interaction.deferReply();

			member.roles.add(role)
				.then(() => ctx.respond(`✅ Role **${role.name}** has been added to the user **${member.user.tag}**.`))
				.catch(err => ctx.respond("An error has occurred while trying to add the role: `" + err + "`"));
		}
	},
	class RemoveRoleSubcommand extends Command {
		constructor() {
			super({
				name: "remove",
				description: "Remove a role from a user",
				args: [
					{
						name: "user",
						description: "The user",
						type: "user",
						required: true
					},
					{
						name: "role",
						description: "The role",
						type: "role",
						required: true
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
				}
			});
		}

		async run(ctx) {
			const member = ctx.parsedArgs["user"],
				role = ctx.parsedArgs["role"];
			if (member.id == ctx.interaction.user.id || member.id == ctx.bot.user.id) return ctx.respond("This command cannot be used on yourself or the bot.", {level: "warning"});
			if (!member.roles.cache.has(role.id)) return ctx.respond(`User **${member.user.tag}** does not have a role named **${role.name}**.`, {level: "warning"});
			if (role.managed) return ctx.respond(`Role **${role.name}** cannot be added to **${member.user.tag}** since it is managed or integrated.`, {level: "warning"});
			const compareTest = compareRolePositions(ctx.interaction, member, role, {action: `remove the role **${role.name}** from`, type: "user"});
			if (compareTest != true) return ctx.respond(compareTest, {level: "warning"});

			await ctx.interaction.deferReply();

			member.roles.remove(role)
				.then(() => ctx.respond(`✅ Role **${role.name}** has been removed from user **${member.user.tag}**.`))
				.catch(err => ctx.respond("An error has occurred while trying to remove the role: `" + err + "`"));
		}
	},
	class CreateRoleSubcommand extends Command {
		constructor() {
			super({
				name: "create",
				description: "Create a role",
				args: [
					{
						name: "name",
						description: "Name of the new role",
						type: "string",
						required: true
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
				}
			});
		}

		async run(ctx) {
			if (ctx.interaction.guild.roles.cache.size >= 250) return ctx.respond("Cannot create role since limit of 250 roles is reached.", {level: "warning"});

			await ctx.interaction.deferReply();

			const roleName = ctx.parsedArgs["name"];
			ctx.interaction.guild.roles.create({name: roleName})
				.then(() => ctx.respond(`✅ Role **${roleName}** has been created.`))
				.catch(err => ctx.respond("An error has occurred while trying to create the role: `" + err + "`"));
		}
	},
	class DeleteRoleSubcommand extends Command {
		constructor() {
			super({
				name: "delete",
				description: "Delete a role",
				args: [
					{
						name: "role",
						description: "Role to delete",
						type: "role",
						required: true
					}
				],
				cooldown: {
					time: 30000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_ROLES"],
					user: ["MANAGE_ROLES"],
					level: 0
				}
			});
		}

		async run(ctx) {
			const role = ctx.parsedArgs["role"];
			if (role.managed) return ctx.respond(`Role **${role.name}** cannot be deleted since it is managed or integrated.`, {level: "warning"});
			const compareTest = compareRolePositions(ctx.interaction, role, null, {action: "delete", type: "role"});
			if (compareTest != true) return ctx.respond(compareTest, {level: "warning"});

			if (ctx.bot.intents.has("GUILD_MEMBERS")) {
				if (role.members.cache.size > 10 && role.members.cache.size > ctx.interaction.guild.memberCount / 10) {
					const promptRes = await promptor.prompt(ctx,
						`You are about to delete the role **${role.name}** (ID ${role.id}), which more than 10% of the members in this server have.`);
					if (promptRes.error) return ctx.respond(promptRes.error, {level: "warning"});
				}
			} else {
				if (role.members.cache.size > 10 && role.members.cache.size > ctx.interaction.guild.memberCount / 20) {
					const promptRes = await promptor.prompt(ctx,
						`You are about to delete the role **${role.name}** (ID ${role.id}), which more than 5% of the active members in this server have.`);
					if (promptRes.error) return ctx.respond(promptRes.error, {level: "warning"});
				}
			}

			role.delete()
				.then(() => ctx.respond(`✅ The role **${role.name}** has been deleted.`))
				.catch(err => ctx.respond("An error has occurred while trying to delete the role: `" + err + "`"));
		}
	},
	class RenameRoleSubcommand extends Command {
		constructor() {
			super({
				name: "rename",
				description: "Renames a role",
				args: [
					{
						name: "role",
						description: "The role",
						type: "role",
						required: true
					},
					{
						name: "name",
						description: "New name for the role",
						type: "string",
						required: true
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
				}
			});
		}

		async run(ctx) {
			const role = ctx.parsedArgs["role"],
				newRoleName = ctx.parsedArgs["name"];
			const compareTest = compareRolePositions(ctx.interaction, role, null, {action: "rename", type: "role"});
			if (compareTest != true) return ctx.respond(compareTest, {level: "warning"});

			role.setName(newRoleName)
				.then(() => ctx.respond(`✅ The role's name has been set to **${newRoleName}**.`))
				.catch(err => ctx.respond("An error has occurred while trying to rename the role: `" + err + "`"));
		}
	},
	class RoleColorSubcommand extends Command {
		constructor() {
			super({
				name: "color",
				description: "Set a role's color",
				args: [
					{
						name: "role",
						description: "The role",
						type: "role",
						required: true
					},
					{
						name: "color",
						description: "New color for the role",
						type: "string",
						parsedType: "color",
						required: true
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
				}
			});
		}

		async run(ctx) {
			const role = ctx.parsedArgs["role"],
				newRoleColor = ctx.parsedArgs["color"];
			const compareTest = compareRolePositions(ctx.interaction, role, null, {action: "change the color of", type: "role"});
			if (compareTest != true) return ctx.respond(compareTest, {level: "warning"});

			role.setColor(newRoleColor)
				.then(() => ctx.respond(`✅ The color of role **${role.name}** has been set to **#${newRoleColor.toString(16)}**.`))
				.catch(err => ctx.respond("An error has occurred while trying to set the color of the role: `" + err + "`"));
		}
	}
];

class RolesCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "roles",
			description: "Server role commands",
			subcommands: subcommands
		});
	}
}

module.exports = RolesCommandGroup;
