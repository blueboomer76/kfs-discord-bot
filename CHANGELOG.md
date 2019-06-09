**Note**: *Some changes, especially command additions in more recent versions, have been compacted into some versions in this changelog.*

*The full changelog is available on the Discord support server.*

# 1.X (current)

## 1.5.0
- Changed the storage method of command usage from array to object form
- Added the command usage from `modules/stats.json` to the bot cache
- Adapted more precise methods for measuring the execution time of functions
- Bumped `discord.js` to 11.5.0 and edited associated depreciations
- Added `mathjs` dependency
- Simplified many expressions to use ternary operators or other efficient forms

## 1.4.17
- Renamed and changed moderation command descriptions and operations
- Added a new check for `commands/advanced` for advanced-level commands
- Bumped versions in `package.json` to latest versions

## 1.4.11
- Added a way to store cumulative bot stats to its cache
- Edited the bot method for writing bot stats

## 1.4.8
- Changed `Number(new Date())` to `Date.now()` in expressions requiring a numbered date
- Reworded many of the event messages and added timestamps for better understanding
- Changed system of handling remote HTTP request errors
- Added many options to purge command

## 1.4.3
- Added emoji support (both custom and default) for inputs to image commands

## 1.4.0
- Added more advanced image commands with customizeable text and GIFs
- Added more commands in many categories
- Changed the wording in some error messages

## 1.3.41
- Fixed many bugs in the code in various parts
- Changed object deletion detection methods to those such as `message.channel.messages.has("some message ID")`

## 1.3.40
- Added bot methods for posting memes and RSS feeds along with their configs

## 1.3.38
- Added ESLint to dependencies and formatted code to its rules
- Fixed bugs and added more utility to commands

## 1.3.35
- Added grouped cooldown support

## 1.3.34
- Added subcommand support to commands
- Changed resolvers to use promises instead
- Added a few commands in multiple categories

## 1.3.27
- Added support for posting to botsfordiscord.com

## 1.3.24
- Added consistency for command error displaying
- Changed the stats posting link for bots.discord.pw to bots.ondiscord.xyz

## 1.3.17
- Changed dependency for headless scraper from `nightmare` to `puppeteer`
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
- Fixed bugs in search and text editing commands

## 1.3.0
- Added a new category Text Editing

## 1.2.29
- Removed `cheerio` dependency for reddit and meme commands

## 1.2.26
- Move commands into category files; `commands` now has no subfolders.
- Added author to reddit and meme commands; added timestamp to reddit command
- Made various bot improvements

## 1.2.17
- Changed argument parser to show alerts if multiple roles, channels, or members are matched
- Adjusted the way bot mentions are handled
- Added comment count to posts shown with reddit command

## 1.2.14
- Moved commands in Bot category to Core category

## 1.2.8
- Added Search category
- Added more music commands, along with reddit command
- Changed `superagent` dependency to `request`

## 1.2.0
- Added music commands (in beta)
- Made lots of command, module, and util bug fixes
- Added text option to purge command

## 1.1.3
- Added a new category Games

## 1.1.0
- Added a more advanced argument parser
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
