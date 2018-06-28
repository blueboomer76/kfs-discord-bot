const Discord = require("discord.js");

module.exports = (bot, guild) => {
	console.log(`This bot has joined ${guild.name} (${guild.id}), which has ${guild.memberCount} members.`)
};