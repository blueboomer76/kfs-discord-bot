*Note: Some changes have been compacted into some versions in this changelog. The full changelog is available on the Discord server.*

# 1.X (current)

## 1.3.34
- Added subcommand support to commands
- Changed resolvers to use promises instead
- Added a few commands in multiple categories

## 1.3.27
- Added support for posting to botsfordiscord.com
- Added time since bot creation to bot stats related commands

## 1.3.24
- Added consistency for command error displaying
- Added options for executing functions after a command has finished executing
- Changed the stats posting link for bots.discord.pw to bots.ondiscord.xyz

## 1.3.17
- Added new commands: rolemembers, birb, and joke
- Separated stats command into two parts: one for the bot and one for the host
- Removed unnecessary require() calls
- Changed some "let" declarations to "const"
- Moved cat and dog commands to Image category

## 1.3.12
- Added an "nsfw" property to commands

## 1.3.9
- Added new commands: emoji, xkcd, and removenickname
- Allowed object resolver to now resolve emojis

## 1.3.7
- Changed argument structure: "num" is no longer a property and is replaced with "infiniteArgs"
- Fix errors in event listeners

## 1.3.4
- Added more image commands

## 1.3.0
- Added a new category Text Editing

## 1.2.26
- Move commands into category files; `commands` now has no subfolders.
- Added author to reddit and meme commands; added timestamp to reddit command
- Made various bot improvements

## 1.2.17
- Changed argument parser to show alerts if multiple roles, channels, or members are matched
- Adjusted the way bot mentions are handled

## 1.2.14
- Moved commands in Bot category to Core category

## 1.2.8
- Added Search category
- Added more music commands
- Changed `superagent` dependency to `request`

## 1.2.0
- Added music commands (in beta)
- Made command, module, and util bug fixes

## 1.1.3
- Added a new category Games

## 1.1.0
- Added a more advanced argument parser and paginator
- Changed commands into class form
- Added new commands, including say and quote
- Added flag options to some commands

## 1.0.0
Initial 1.X version

# 0.X (beta)
## 0.5.0
- Reimplemented cooldowns
- Simplified permission system
- Added Direct Message checks

## 0.4.0
- Added member finder
- Moved events to its own folder
- Simplified `index.js` code
- Improved the alias system

## 0.3.1
- Added new category Moderation
- Removed phone command and some more code from `index.js`

## 0.3.0
- Added an alias system
- Added config properties to some commands

## 0.2.5
- Added role info, bot info, user info, invite, and server info commands
- Fixed error console log messages when there are code errors
- Tweaked other commands

## 0.2.0
- Added command handler to prevent `index.js` from becoming too large
- Added some basic commands

## 0.1.0
Initial 0.X version
