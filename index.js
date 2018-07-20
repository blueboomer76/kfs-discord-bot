const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
bot.phoneVars = {channels: [], msgCount: 0, callExpires: 0};

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
				jsfiles = files.filter(f => f.split(".").pop() == "js");
				if (jsfiles.length != 0) {
					jsfiles.forEach((f2, i2) => {
						fCounter++;
						var props = require(`./commands/${f1}/${f2}`);
						bot.commands.set(props.help.name, props);
						if (props.config.aliases.length > 0) {
							props.config.aliases.forEach(a => {
								bot.aliases.set(a, props.help.name);
							})
						}
					})
					console.log(`${fCounter} files have been loaded in the category ${f1}.`);
				}
			})
		})
	}
})

fs.readdir("./events/", (err, files) => {
	var evfiles;
	var evCounter = 0;
	if (err) console.log(err);
	evfiles = files.filter(f => f.split(".").pop() == "js");
	if (evfiles.length != 0) {
		evfiles.forEach(f => {
			evCounter++;
			var eventName = f.split(".")[0];
			var ev = require(`./events/${f}`);
			bot.on(eventName, ev.bind(null, bot));
			delete require.cache[require.resolve(`./events/${f}`)];
		})
		console.log(`${evCounter} events have been loaded.`);
	} else {
		console.log("No events were found!")
	}
})

bot.login(config.token);