const Discord = require("discord.js");
const config = require("./config.json");
const fs = require("fs");

const bot = new Discord.Client();
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
	if (err) throw err;
	var jsfiles = files.filter(f => f.split(".").pop() === "js");
	if (jsfiles.length == 0) throw new Error("No commands found in directory");
	jsfiles.forEach((f, i) => {
		var props = require(`./commands/${f}`);
		console.log("The file " + f + " has been loaded.");
		bot.commands.set(props.help.name, props);
	})
})

var arr;
var phoneChannels = [];
var phoneMsgCount = 0;
var recentCommands = {"channels": [], "commands": [], "removeAt": []}

function decreasePMC() {phoneMsgCount--;}

function addCooldown(chnlID, command, msecs) {
	recentCommands.channels.push(chnlID);
	recentCommands.commands.push(command);
	recentCommands.removeAt.push(Number(new Date()) + msecs);
	bot.setTimeout(removeCooldown, msecs, chnlID, command)
}
function removeCooldown(chnlID, command) {
	var i = 0;
	var currCdIndex = 0;
	var chnlCdIndex;
	while (currCdIndex < recentCommands.channels.length) {
		chnlCdIndex = recentCommands.channels.indexOf(chnlID, currCdIndex);
		if (chnlCdIndex == recentCommands.commands.indexOf(command, currCdIndex) && chnlCdIndex != -1) {
			i = currCdIndex;
		}
		currCdIndex++;
	}
	recentCommands.channels.splice(i, 1);
	recentCommands.commands.splice(i, 1);
	recentCommands.removeAt.splice(i, 1);
}

bot.on("ready", () => {
	console.log("Bot started successfully on " + new Date());
	bot.user.setActivity("with you in " + bot.guilds.size + " servers");
});

bot.on("guildCreate", guild => {
	console.log(`This bot has joined ${guild.name} (${guild.id}), which has ${guild.memberCount} members.`)
});

bot.on("guildDelete", guild => {
	console.log(`This bot has been removed from ${guild.name} (${guild.id})`)
});

bot.on("message", async message => {
	if (message.author.bot) return;
	var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	var currChannel = message.channel.id;
	var command = args.shift().toLowerCase();
	if (message.content.startsWith(config.prefix)) {
		if (message.guild && !message.channel.permissionsFor(bot.user).has("SEND_MESSAGES")) return;
		var cdIndex = -1;
		var currCdIndex = 0;
		var chnlCdIndex;
		while (currCdIndex < recentCommands.channels.length) {
			chnlCdIndex = recentCommands.channels.indexOf(currChannel, currCdIndex);
			if (chnlCdIndex == recentCommands.commands.indexOf(command, currCdIndex) && chnlCdIndex != -1) {
				cdIndex = currCdIndex;
			}
			currCdIndex++;
		}
		if (cdIndex == -1) {
			if (config.currCommands.indexOf(command) != -1) {
				addCooldown(currChannel, command, config.cooldowns[config.currCommands.indexOf(command)]);
			}
			if (command == "phone") {
				let phoneMsg = "";
				let phoneMsg0 = "";
				if (phoneChannels.indexOf(currChannel) == -1) {
					phoneChannels.push(currChannel);
					if (phoneChannels.length == 1) {
						message.react("☎");
					} else {
						message.channel.send(":telephone: A phone connection has started! Greet them!");
						if (phoneChannels.length == 2) {
							phoneMsg0 = "The other side has picked up!";
						} else {
							phoneMsg0 = "Looks like someone else picked up the phone."
							bot.channels.get(phoneChannels.shift()).send(":telephone: Someone else is now using the phone...");
						}
						bot.channels.get(phoneChannels[0]).send(":telephone: " + phoneMsg0)
					}
				} else {
					if (phoneChannels.length == 1) {
						phoneMsg = "There was no response from the phone, hanging up.";
					} else {
						arr = 0;
						phoneMsg = "The phone was hung up.";
						if (currChannel == phoneChannels[0]) {arr = 1};
						bot.channels.get(phoneChannels[arr]).send(":telephone: " + phoneMsg);
					}
					phoneChannels = [];
					message.channel.send(":telephone: " + phoneMsg);
				}
			} else {
				let commandfile = bot.commands.get(command);
				if (commandfile) {
					commandfile.run(bot, message, args)
					.catch(err => {
						var e = err;
						if (err && err.stack) e = err.stack;
						message.channel.send(":x: An error has occurred while running the command:```" + e + "```This error has been reported.")
						if (message.guild.id != config.ownerServerID) {
							bot.channels.get(config.errorChannel).send(message.channel.name + " (ID " + currChannel + ")```" + e + "```")
						}
					});
				}
			}
		} else {
			message.channel.send(":no_entry: **Cooldown:**\nThe `" + command + "` command can't be used again for " +
			(Math.floor((recentCommands.removeAt[cdIndex] - new Date()) / 100) / 10) + " seconds!");
		}
	} else if (phoneChannels.length > 1 && phoneChannels.indexOf(currChannel) != -1) {
		if (message.guild && !message.channel.permissionsFor(bot.user).has("SEND_MESSAGES")) return;
		phoneMsgCount++;
		setTimeout(decreasePMC, 5000);
		arr = 0;
		if (currChannel == phoneChannels[0]) {arr = 1};
		bot.channels.get(phoneChannels[arr]).send(":telephone_receiver: " + message.content);
		if (phoneMsgCount > 4) {
			phoneMsg = ":telephone: The phone connection was cut off due to being overloaded."
			bot.channels.get(phoneChannels[0]).send(":telephone_receiver: " + phoneMsg);
			bot.channels.get(phoneChannels[1]).send(":telephone_receiver: " + phoneMsg);
			phoneChannels = [];
		}
	}
});

process.on("uncaughtException", err => {
	console.error(`[Exception] ${new Date()}:`)
	console.error(err.stack);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error(`[Promise Rejection] ${new Date()}:`)
	console.error(promise);
});

bot.login(config.token);
