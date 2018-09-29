const Discord = require("discord.js");

module.exports = async (bot, error) => {
	console.log(`The client has encountered a connection error:`)
	console.debug(error);
	console.log("The bot will restart.")
	process.exit(1);
};