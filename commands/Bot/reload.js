const config = require("../../config.json");

module.exports.run = async (bot, message, args) => {
	if (config.ownerIDs.indexOf(message.author.id) == -1) return message.channel.send("This command is owner-only.");
	if (args.length == 0) return message.channel.send("You need to provide a category and a command in that category to reload.");
	var category = args[0].charAt(0).toUpperCase() + args[0].slice(1);
	var cmd = args[0].toLowerCase();
	try {
		delete require.cache[require.resolve(`../${category}/${cmd}.js`)];
		var newData = require(`../${category}/${cmd}.js`);
		bot.commands.set(cmd, newData);
		message.channel.send(`The command ${cmd} was reloaded.`);
	} catch (err) {
		message.channel.send("An error occurred. You either provided an nonexistent category or command, or the bot encountered an error.");
	}
};

module.exports.help = {
	"name": "reload"
}
