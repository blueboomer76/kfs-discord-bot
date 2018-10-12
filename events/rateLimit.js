module.exports = async (bot, rateLimitInfo) => {
	if (rateLimitInfo.limit == 1) return;
	console.log("The client has reached a rate limit:");
	console.log(rateLimitInfo);
};
