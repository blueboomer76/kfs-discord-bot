module.exports = async bot => {
	if (bot.connectionRetries > 0) return;
	console.log(`[${new Date().toJSON()}] WebSocket is attempting to reconnect...`);
};
