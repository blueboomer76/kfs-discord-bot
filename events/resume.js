module.exports = async (bot, replayed) => {
	console.log(`[${new Date().toJSON()}] WebSocket has reconnected with ${replayed} replayed events.`);
};
