module.exports = async bot => {
	if (bot.downtimeTimestampBase != null) return;
	bot.downtimeTimestampBase = Date.now();
	console.log(`[${new Date().toJSON()}] WebSocket is attempting to reconnect...`);
};
