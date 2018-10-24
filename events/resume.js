const Discord = require("discord.js");

module.exports = async (bot, error, replayed) => {
	console.log(`The client has reconnected with ${replayed} replayed events.`)
};