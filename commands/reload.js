const Discord = require("discord.js");

module.exports.run = (bot, message, args) => {
	if (!args || args.size < 1) return message.reply("No command was provided to reload!");
	delete require.cache[require.resolve(`./${args[0]}.js`)];
	message.channel.send(`The command ${args[0]} was reloaded.`);
};

module.exports.help = {
	"name": "reload"
}
