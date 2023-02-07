const {MessageEmbed} = require("discord.js"),
	CommandGroup = require("../../structures/commandGroup.js"),
	Command = require("../../structures/command.js"),
	{capitalize, getReadableName, getDateAndDurationString} = require("../../modules/functions.js"),
	{fetchMembers} = require("../../modules/memberFetcher.js");

const subcommands = [
	class AvatarSubcommand extends Command {
		constructor() {
			super({
				name: "avatar",
				description: "Get a user's avatar",
				args: [
					{
						name: "user",
						description: "The user",
						type: "user",
						required: true
					},
					{
						name: "format",
						description: "The image format",
						type: "string",
						choices: [
							{name: "GIF", value: "gif"},
							{name: "JPEG", value: "jpg"},
							{name: "PNG", value: "png"},
							{name: "WEBP", value: "webp"}
						]
					},
					{
						name: "size",
						description: "The image size",
						type: "integer",
						choices: [
							{name: "16x16", value: 16},
							{name: "32x32", value: 32},
							{name: "64x64", value: 64},
							{name: "128x128", value: 128},
							{name: "256x256", value: 256},
							{name: "512x512", value: 512},
							{name: "1024x1024", value: 1024},
							{name: "2048x2048", value: 2048},
							{name: "4096x4096", value: 4096}
						]
					}
				],
				cooldown: {
					time: 15000,
					type: "channel"
				}
			});
		}

		async run(ctx) {
			const user = ctx.parsedArgs["user"].user;
			const avatarURL = user.avatarURL({
				format: ctx.parsedArgs["format"] || "png",
				dynamic: true,
				size: ctx.parsedArgs["size"]
			}) || `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
			ctx.respond(new MessageEmbed()
				.setTitle("Avatar - " + user.tag)
				.setDescription("Avatar URL: " + avatarURL)
				.setColor(Math.floor(Math.random() * 16777216))
				.setImage(avatarURL)
			);
		}
	},
	class UserInfoSubcommand extends Command {
		constructor() {
			super({
				name: "info",
				description: "Get a user's information",
				args: [
					{
						name: "user",
						description: "The user",
						type: "user",
						required: true
					}
				],
				cooldown: {
					time: 15000,
					type: "channel"
				}
			});
		}

		async run(ctx) {
			const member = ctx.parsedArgs["user"],
				user = member.user;

			const userFlags = user.flags && user.flags.bitfield != 0 ? user.flags.toArray().map(getReadableName).join(", ") : "None";

			const userEmbed = new MessageEmbed()
				.setTitle("User Info - " + user.tag)
				.setFooter({text: "ID: " + user.id})
				.setThumbnail(user.avatarURL({format: "png", dynamic: true}) || `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`)
				.addField("Account created at", getDateAndDurationString(user.createdTimestamp))
				.addField("Joined this server at", getDateAndDurationString(member.joinedTimestamp))
				.addField("Features", userFlags)
				.addField("Bot user", user.bot ? "Yes" : "No", true);

			if (ctx.bot.intents.has("GUILD_PRESENCES")) {
				const rawPresence = member.presence || user.presence,
					presence = capitalize(rawPresence.status);
				let customStatus = "",
					activityString = "";
				for (const activity of rawPresence.activities) {
					if (activity.type == "CUSTOM_STATUS") {
						customStatus = "\n" + "__Custom Status__: " + activity.state;
					} else {
						const typeString = activity.type == "LISTENING" ? "Listening to" : capitalize(activity.type);
						activityString += "\n__" + typeString + "__ " + activity.name;
					}
				}

				userEmbed.addField("Status", presence + customStatus + activityString, true);
			} else {
				userEmbed.addField("Status", "No Data");
			}

			userEmbed.addField("Nickname", member.nickname || "None", true);

			if (ctx.bot.intents.has("GUILD_MEMBERS")) {
				const guildMembers = await fetchMembers(ctx),
					guildMemArray = [...guildMembers.cache.values()].sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
				const joinPos = guildMemArray.findIndex(mem => mem.joinedTimestamp == member.joinedTimestamp),
					nearbyMems = [],
					startPos = Math.max(joinPos - 2, 0),
					endPos = Math.min(joinPos + 2, ctx.interaction.guild.memberCount - 1);
				for (let i = startPos; i <= endPos; i++) {
					nearbyMems.push(i == joinPos ? `**${guildMemArray[i].user.username}**` : guildMemArray[i].user.username);
				}

				userEmbed.addField("Member #", joinPos + 1, true)
					.addField("Join order", nearbyMems.join(" > "));
			}

			const memRoles = [];
			for (const role of member.roles.cache.values()) memRoles.push(role.name);
			memRoles.shift();

			let roleList;
			if (memRoles.length == 0) {
				roleList = "None";
			} else {
				roleList = memRoles.join(", ");
				if (roleList.length > 1000) roleList = roleList.slice(0, 1000) + "...";
			}

			userEmbed.addField("Roles - " + memRoles.length, roleList);

			if (member.displayColor != 0 || (member.roles.color && member.roles.color.color == 0)) {
				userEmbed.setColor(member.displayColor);
			}

			ctx.respond(userEmbed);
		}
	}
];

class UserCommandGroup extends CommandGroup {
	constructor() {
		super({
			name: "user",
			description: "User commands",
			subcommands: subcommands
		});
	}
}

module.exports = UserCommandGroup;
