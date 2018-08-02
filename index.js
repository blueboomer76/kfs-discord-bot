const Discord = require("discord.js");
const config = require("./config.json");
const fs = require("fs");

const bot = new Discord.Client();
bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
bot.phoneVars = {channels: [], msgCount: 0, callExpires: 0};

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
						bot.commands.set(props.commandInfo.name, props);
						if (props.commandInfo.aliases.length > 0) {
							props.commandInfo.aliases.forEach(a => {
								bot.aliases.set(a, props.commandInfo.name);
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
	if (err) {console.log(err); return}
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
		console.log("No events were found!");
	}
})

process.on("uncaughtException", err => {
	console.error(`[Exception] ${new Date()}:`)
	console.error(err.stack);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error(`[Promise Rejection] ${new Date()}:`)
	console.error(promise);
});

bot.login(config.token);
