module.exports.prompt = async (message, notice) => {
	let code = Math.floor(Math.random() * 100000).toString(), cmdErr;
	if (code.length < 5) {while (code.length < 5) {code = `0${code}`;}}
	message.channel.send(`${notice}\nType \`${code}\` to proceed. This operation will time out in 30 seconds.`)
	await message.channel.awaitMessages(msg => msg.author.id == message.author.id, {
		max: 1,
		time: 30000,
		errors: ["time"]
	})
	.then(collected => {
		if (collected.array()[0].content != code) cmdErr = "You provided an invalid response, cancelling the operation."
	})
	.catch(() => {cmdErr = "Operation has timed out after 30 seconds."})
	return cmdErr;
}
