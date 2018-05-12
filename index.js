const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
	if (err) console.log(err);
	var jsfile = files.filter(f => f.split(".").pop() === "js");
	if (jsfile.length == 0) {
		console.log("Commands could not be found!");
		return;
	}
	jsfile.forEach((f, i) => {
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

function addCooldown(msecs, msg) {
	recentCommands.channels.push(msg);
	recentCommands.commands.push(command);
	recentCommands.removeAt.push(Number(new Date()) + msecs);
	bot.setTimeout(removeCooldown, msecs, msg)
}
function removeCooldown(chnl) {
	var ind = recentCommands.channels.indexOf(chnl);
	recentCommands.channels.splice(ind, 1);
	recentCommands.commands.splice(ind, 1);
	recentCommands.removeAt.splice(ind, 1);
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
	args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	command = args.shift().toLowerCase();
	if (message.content.startsWith(config.prefix)) {
		var currChannel = message.channel.toString()
		var cdIndex = recentCommands.channels.indexOf(currChannel);
		if (recentCommands.channels.indexOf(currChannel) == -1) {
			if (config.currCommands.indexOf(command) != -1) {
				addCooldown(config.cooldowns[config.currCommands.indexOf(command)], currChannel);
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
							bot.channels.get(phoneChannels.shift().toString()).send(":telephone: Someone else is now using the phone...");
						}
						bot.channels.get(phoneChannels[0]).send(":telephone: " + phoneMsg0)
					}
				} else {
					if (phoneChannels.length == 1) {
						phoneMsg = "There was no response from the phone, so hanging up.";
					} else {
						arr = 0;
						phoneMsg = "The phone was hung up.";
						if (message.channel.id == phoneChannels[0].toString()) {arr = 1};
						bot.channels.get(phoneChannels[arr].toString()).send(":telephone_receiver: " + phoneMsg);
					}
					phoneChannels = [];
					message.channel.send(":telephone: " + phoneMsg);
				}
			} else {
				let commandfile = bot.commands.get(command);
				if (commandfile) {
					try {
						commandfile.run(bot, message, args);
					} catch(err) {
						message.channel.send(":x: I would be too adorable to throw this error... ```" + err.stack + "```This error has been reported to the official server, if the error did not happen in it.")
						if (message.guild.id != "308063187696091140") {
							bot.channels.get("433132235420598272").send(message.channel.name + " (ID " + message.channel.id + ")```" + err.stack + "```")
						}
					}
				}
			}
		} else if (recentCommands.commands[cdIndex] == command) {
			message.channel.send(":no_entry: **Cooldown:**\nThe `" + command + "` command can't be used again for " +
			(Math.floor((recentCommands.removeAt[cdIndex] - new Date()) / 100) / 10) + " seconds!");
		}
	} else if (phoneChannels.length > 1 && phoneChannels.indexOf(message.channel.id.toString()) != -1) {
		phoneMsgCount++;
		setTimeout(decreasePMC,5000);
		arr = 0;
		if (message.channel.id == phoneChannels[0].toString()) {arr = 1};
		bot.channels.get(phoneChannels[arr].toString()).send(":telephone_receiver: " + message.content);
		if (phoneMsgCount > 4) {
			phoneMsg = ":telephone: The phone connection was cut off due to being overloaded."
			bot.channels.get(phoneChannels[0].toString()).send(":telephone_receiver: " + phoneMsg);
			bot.channels.get(phoneChannels[1].toString()).send(":telephone_receiver: " + phoneMsg);
			phoneChannels = [];
		}
	}
});

bot.login(config.token);
