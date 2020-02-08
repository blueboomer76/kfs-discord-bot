module.exports = async (bot, event) => {
	console.error(`[${new Date().toJSON()}] WebSocket client has disconnected:`);
	console.error(event);
	process.exit();
};
