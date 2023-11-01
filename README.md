# Discord Dom Inspector Bot, the Abomination of Interspection

A Discord interface to [Larzm's Mod Inspector](https://larzm42.github.io/dom5inspector/) via the [dom5api](https://github.com/gtim/dom5api). Currently available at the Immersion discord server.

Updated to discord.js v14 to add new functionality.

## Plans
- Convert current log gathering to use a DB instead of just logging to the console.log
- Disambiguate when there's multiple matches (e.g. `/unit size 6 water elemental` and `/commander LA sauromancer`)
- Implement mentor notes
- Prepare for the release of Dominions 6 (will need to wait for an update to larzm42's dominspector first probably)

**Currently working on**
- Convert current log gathering to use a DB instead of just logging to the console.log

**Small ideas / bugs to fix**
* If multiple items share the exact same name, then output all
* If a query returns multiple answers (like "longdead"), create a way to immediately navigate to one of the other search results (most likely
    through a Discord button attached to the Embed)

**Potential future plans**
* site searcher (e.g. list forest sites that give order)
* item searcher (e.g. list +MR items, max const4)
* mod support, e.g. `/spell DE fuel the fire` (color-code embed)
* `/event`
* enable "more + show keys" in screenshots somehow, maybe with emoji-react?
* moving away from inspector screenshots to information in the embed itself

## Hosting own version of the bot 
* Create a discord bot through the [Discord Developer Portal](https://discord.com/developers/docs/intro)
* Remember to grab the bot token
* Clone the github repoistory of the Dom_Inspector_Bot and save it locally
* Create an config.json file to hold the "clientID", "guildID" and "token" for the bot if you plan to host it on a single server. 
* If you plan to publish your version of the bot to github, remember to include your token containing file in the .gitignore list
* If you plan to have your version of the bot on multiple servers, you won't need a clientID or guildID in your config.json file, you will only need your bot token
