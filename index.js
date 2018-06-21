const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
	var jsfiles, fCounter;
	if (err) console.log(err);
	var subdirs = files;
	if (subdirs.length == 0) {
		console.log("No category folders were found.")
	} else {
		subdirs.forEach((f1, i1) => {
			fs.readdir(`./commands/${f1}`, (err, files) => {
				fCounter = 0;
				if (err) console.log(err);
				jsfiles = files.filter(f2 => f2.split(".").pop() == "js");
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

var args, command;
var recentCommands = {"ids": [], "commands": [], "removeAt": []}

function addCooldown(msecs, msg) {
	recentCommands.ids.push(msg);
	recentCommands.commands.push(command);
	recentCommands.removeAt.push(Number(new Date()) + msecs);
	bot.setTimeout(removeCooldown, msecs, msg)
}
function removeCooldown(sf) {
	var ind = recentCommands.ids.indexOf(sf);
	recentCommands.ids.splice(ind, 1);
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
	if (message.author.bot || !message.content.startsWith(config.prefix)) return;
	args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	command = args.shift().toLowerCase();
	var currChannel = message.channel.toString();
	var cdIndex = recentCommands.ids.indexOf(currChannel);
	if (recentCommands.ids.indexOf(currChannel) == -1) {
		if (config.currCommands.indexOf(command) != -1) {
			addCooldown(config.cooldowns[config.currCommands.indexOf(command)], currChannel);
		} else if (command == "reload") {
			if (!args || args.size < 2) return message.reply("You must provide a category and a command in that category to reload.");
			try {
				delete require.cache[require.resolve(`./commands/${args[0]}/${args[1]}.js`)];
				var newData = require(`./commands/${args[0]}/${args[1]}.js`)
				bot.commands.set(args[1], newData);
				message.channel.send(`The command ${args[1]} was reloaded.`);
			} catch(err) {
				message.channel.send("An error occurred. You either provided an nonexistant category or command, or the bot encountered an error.");
			}
		} else {
			var rCommand = bot.commands.get(command);
			if (rCommand) {
				rCommand.run(bot, message, args).catch(err => message.channel.send("An error occurred while trying to execute this code. ```javascript" + "\n" + err.stack + "```"));
			} else {
				var cAliases = require("./modules/aliases.json");
				var caIndex = cAliases.aliases.indexOf(command)
				if (caIndex != -1) {
					var rCommand = bot.commands.get(cAliases.aCmds[caIndex]);
					rCommand.run(bot, message, args).catch(err => message.channel.send("An error occurred while trying to execute this code. ```javascript" + "\n" + err.stack + "```"));
				}
			}
		}
	} else if (recentCommands.commands[cdIndex] == command) {
		message.channel.send(":no_entry: **Cooldown:**\nThe `" + command + "` command can't be used again for " +
		(Math.floor((recentCommands.removeAt[cdIndex] - new Date()) / 100) / 10) + " seconds!");
	}
});

bot.login(config.token);