[![Bot Widget](https://discordbots.org/api/widget/333058410465722368.svg)](https://discordbots.org/bots/333058410465722368)

# KFS Discord Bot
A multipurpose Discord bot for fun, utility, and more, written in discord.js.

## Description
This is an **actively developed bot** that not only has fun, moderation, utility commands, but also a phone command for calling other servers, and combines features from popular bots.

## How to install
*Note: You need to have Node.js installed before you can start the bot*

1. Install a program that can clone GitHub repositories, such as Git Bash for Windows
2. Open the program and run `git clone` with this repository's clone URL
3. Open the Command Prompt and run `cd ../path/to/directory` or similar if necessary to move the directory to the kfs-discord-bot repository.
4. Create a file `config.json` and include the following, substituting the required values:
```json
{
	"token": "<your bot token>",
	"ownerIDs": [
		"<array of owner IDs>"
	],
	"adminIDs": [
		"<array of admin IDs>"
	],
	"botModIDs": [
		"<array of bot moderator IDs>"
	],
	"moderatorIDs": [
		"<array of moderator IDs>"
	],
	"supportIDs": [
		"<array of support IDs>"
	],
	"prefix": "<your prefix>",
	"ideaWebhookID": "<suggestions webhook ID>",
	"ideaWebhookToken": "<suggestions webhook token>"
}
```
5. Install all dependencies with `npm install <package>` as shown in `package.json`.
6. Run `node index.js`

## References
Link to invite the bot: [Go!](https://discordapp.com/oauth2/authorize?client_id=333058410465722368&permissions=405921878&scope=bot)

Link to official server: [Go!](https://discord.gg/yB8TvWU)
