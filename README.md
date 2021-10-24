# KFS Discord Bot

A multipurpose Discord bot for fun, moderation, utility, and more, written in discord.js. It can connect servers together and combines features from popular bots in modular files, such as the argument parser, object resolver, and image manager.

## Installation

*Requires Node.js 16.6.0 or newer and a 64-bit operating system. Only 2.X bot versions are now supported.*

1. Install a program that can clone GitHub repositories, such as Git Bash for Windows
2. Run `git clone` with this repository's clone URL
3. Open Command Prompt (Windows), Terminal (Mac), or other program and run `cd ../path/to/directory` or similar if necessary to move the directory to the kfs-discord-bot repository.
4. Rename the file `config.example.json` to `config.json` and replace everything in brackets (`<`, `>`, `[`, or `]`) with the correct values. Required values (with `<` and `>`) are needed for the bot to work, and optional values (with `[` and `]`) can use `null` in place of the value. For optional arrays, the whole array is replacable with `null`.
5. Run `npm install` to install the dependencies
6. Run `node index.js`

Update the bot by running `git pull` to get the latest features and bug fixes.

## Other Information

*`assets/Oswald-Regular.ttf` in this repository is an open sourced [Google Font](https://developers.google.com/fonts) used in some image-based commands.*

[Bot Invite](https://discord.com/oauth2/authorize?client_id=333058410465722368&permissions=405921878&scope=applications.commands%20bot) (not guaranteed due to introduction of Discord intents starting from October 2020)

Official Discord Server: [![Server Widget](https://discord.com/api/guilds/308063187696091140/widget.png)](https://discord.gg/yB8TvWU)
