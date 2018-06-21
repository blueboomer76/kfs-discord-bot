const Discord = require("discord.js");
const config = require("./config.json");
const fs = require("fs");

const bot = new Discord.Client();
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err1, files1) => {
	if (err1) throw err1;
	var subdirs = files1;
	if (subdirs.length == 0) {
		throw new Error("No category folders found in directory");
	} else {
		var jsfiles, fCounter;
		subdirs.forEach((f1, i1) => {
			fs.readdir(`./commands/${f1}`, (err2, files2) => {
				if (err2) return;
				fCounter = 0;
				jsfiles = files2.filter(f2 => f2.split(".").pop() == "js");
				if (jsfiles.length != 0) {
					jsfiles.forEach((f2, i2) => {
						fCounter++;
						var props = require(`./commands/${f1}/${f2}`);
						bot.commands.set(props.help.name, props);
					})
					console.log(`${fCounter} files have been loaded in the category ${f1}.`);
				}
			})
		})
	}
})

var initialized = false;
var recentCommands = {"ids": [], "commands": [], "removeAt": []}

function addCooldown(chnlID, command, msecs) {
	recentCommands.ids.push(chnlID);
	recentCommands.commands.push(command);
	recentCommands.removeAt.push(Number(new Date()) + msecs);
	bot.setTimeout(removeCooldown, msecs, chnlID, command)
}
function removeCooldown(chnlID, command) {
	var i = 0;
	var currCdIndex = 0;
	var chnlCdIndex;
	while (currCdIndex < recentCommands.ids.length) {
		chnlCdIndex = recentCommands.ids.indexOf(chnlID, currCdIndex);
		if (chnlCdIndex == recentCommands.commands.indexOf(command, currCdIndex) && chnlCdIndex != -1) {
			i = currCdIndex;
		}
		currCdIndex++;
	}
	recentCommands.ids.splice(i, 1);
	recentCommands.commands.splice(i, 1);
	recentCommands.removeAt.splice(i, 1);
}

bot.on("ready", () => {
	bot.user.setActivity("with you in " + bot.guilds.size + " servers");
	if (!initialized) {
		initialized = true;
		console.log("Bot started successfully on " + new Date());
	}
});

bot.on("guildCreate", guild => {
	console.log(`This bot has joined ${guild.name} (${guild.id}), which has ${guild.memberCount} members.`)
});

bot.on("guildDelete", guild => {
	console.log(`This bot has been removed from ${guild.name} (${guild.id})`)
});

bot.on("message", async message => {
	if (message.author.bot || !message.content.startsWith(config.prefix)) return;
	var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	var currChannel = message.channel.id;
	var command = args.shift().toLowerCase();
	var cdIndex = -1;
	var currCdIndex = 0;
	var chnlCdIndex;
	while (currCdIndex < recentCommands.ids.length) {
		chnlCdIndex = recentCommands.ids.indexOf(currChannel, currCdIndex);
		if (chnlCdIndex == recentCommands.commands.indexOf(command, currCdIndex) && chnlCdIndex != -1) {
			cdIndex = currCdIndex;
		}
		currCdIndex++;
	}
	if (cdIndex == -1) {
		if (config.currCommands.indexOf(command) != -1) {
			addCooldown(currChannel, command, config.cooldowns[config.currCommands.indexOf(command)]);
		}
		let rCommand = bot.commands.get(command);
		if (rCommand) {
			if (message.guild && !message.channel.permissionsFor(bot.user).has(["VIEW_CHANNEL", "SEND_MESSAGES"])) return;
			rCommand.run(bot, message, args)
			.catch(err => {
				var e = err;
				if (e && err.stack) e = err.stack;
				if (e && e.length > 1500) e = e.slice(0, 1500) + "...";
				message.channel.send("An error has occurred while running the command:```javascript" + "\n" + e + "```");
			});
		}
	} else {
		message.channel.send(":no_entry: **Cooldown:**\nThe `" + command + "` command can't be used again for " +
		(Math.floor((recentCommands.removeAt[cdIndex] - new Date()) / 100) / 10) + " seconds!");
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
