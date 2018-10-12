const Discord = require("discord.js");

module.exports = async (bot, ev) => {
	console.log(`The client has disconnected:`)
	console.log(ev);
	console.log("The bot will restart.")
	process.exit(2);
};