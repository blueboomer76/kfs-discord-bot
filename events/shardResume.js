module.exports = async (bot, shardID, replayed) => {
	console.log(`[${new Date().toJSON()}] WebSocket has reconnected with ${replayed} replayed events.`);
	bot.downtimeTimestampBase = null;
};
