# Discord Dom Inspector Bot, the Abomination of Interspection

A Discord interface to [Larzm's Mod Inspector](https://larzm42.github.io/dom5inspector/) via [dom6api](https://github.com/Calioses/dom6api), (previously via [dom5api](https://github.com/gtim/dom5api)). Currently available on several Dominions related Discord servers like: Immersion, Dominions Game Hub, Ruby, Nexus etc.

-----

## Motivation:
The idea for the bot arose from wanting a quick and easy way to query Larzm's Mod Inspector while having a discussion on Discord without having to go to the website. Particularly important when you are on a mobile device.

## Plans:
- Get feedback on Dominions6 support and implement features/changes based on that
- Support for events (already supported by dom6api)

## Currently working on:
- Finishing Dominions 6 implementation

## Small ideas / bugs to fix:
- Currently none identified.

## Potential future plans:
- Site searcher (e.g. list forest sites that give order)
- Item searcher (e.g. list +MR items, max const4)
- Mod support, e.g. `/spell DE fuel the fire` (color-code embed)
- `/event`
- Enable "more + show keys" in screenshots somehow, maybe with emoji-react?
- Moving away from inspector screenshots to information in the embed itself

## Quick Start (or, I want to host my own version of the bot):
- Create a discord bot through the [Discord Developer Portal](https://discord.com/developers/docs/intro)
- Remember to grab the bot token.
- Clone the github repoistory of the Dom_Inspector_Bot and save it locally.
- Create an config.json file to hold the "clientID", "guildID" and "token" for the bot if you plan to host it on a single server. 
- If you plan to have your version of the bot on multiple servers, you won't need a guildID in your config.json file.
- If you plan to publish your version of the bot to github, remember to include your token containing file in the .gitignore list.
- Run `npm install` to install dependencies.
- Push your slash commands with `node deploy-commands.js` to the servers.
- In the [Discord Developer Portal](https://discord.com/developers/applications), enable only the **Guilds** intent under Bot settings. Message Content is not required.
- Spin up the bot instance with `node index.js`.

-----

## Usage (sample commands and bot responses):

All commands are slash commands (e.g. `/unit`, `/spell`). Type `/` in Discord to see available commands.

### Unit:

| Command | User Input | Response | Note |
| ------- | ------- | ------------------------- | ------------------------------ |
| /unit | 145 | Embed with Hirdman | The bot can search for units based on their ID. No similar matches are shown in this case as the search is specific. |
| /unit | water elemental | Embed with size 6 water elemental | Since there are other units with similar names, the bot will shown them in the embed footer and provide clickable buttons to search for the similar matches with a single click. |
| /unit | wele | Embed with size 6 water elemental | The bot has a list of commonly used aliases. Aliases also can return similar matches, like in this case. |
| /unit | wele 4 | Embed with size 4 water elemental | The bot has basic size filtering. Provide unit name and then the size. If a unit with such a size exists, that will be provided in the embed. Bot will also provide similar matches (usually units with similar/same name but different size) in the embed footer and clickable buttons. |

### Spell:

| Command | User Input | Response | Note |
| ------- | ------- | ------------------------- | ------------------------------ |
| /spell | 151 | Embed with Banishment spell | The bot can search for spells based on their ID. No similar matches are shown in this case as the search is specific. |
| /spell | fire | Embed with Heavenly Fire | Since there are other spells with similar names, the bot will shown them in the embed footer and provide clickable buttons to search for the similar matches with a single click. |
| /spell | l4l | Embed with Life for Life | The bot has a list of commonly used aliases. Aliases also can return similar matches (not in this case). |

### Site:

| Command | User Input | Response | Note |
| ------- | ------- | ------------------------- | ------------------------------ |
| /site | 151 | Embed with The Swamps of Ur | The bot can search for sites based on their ID. No similar matches are shown in this case as the search is specific. |
| /site | fire | Embed with Fountain of Fire | Since there are other sites with similar names, the bot will shown them in the embed footer and provide clickable buttons to search for the similar matches with a single click. |
| /site | best | Embed with Lava Lake | The bot has a list of commonly used aliases. Aliases also can return similar matches (not in this case). Since sites are rarely searched, this is the only alias and it was added as a joke. |

### Item:

| Command | User Input | Response | Note |
| ------- | ------- | ------------------------- | ------------------------------ |
| /item | 151 | Embed with Lead Shield | The bot can search for items based on their ID. No similar matches are shown in this case as the search is specific.|
| /item | fire | Embed with Fire Sword | Since there are other items with similar names, the bot will shown them in the embed footer and provide clickable buttons to search for the similar matches with a single click. |
| /item | zyzz | Embed with The Copper Arm | The bot has a list of commonly used aliases. Aliases also can return similar matches (not in this case). |

### Merc (mercenary):

| Command | User Input | Response | Note |
| ------- | ------- | ------------------------- | ------------------------------ |
| /merc | 1 | Embed with Dante's Stingers | The bot can search for mercenaries based on their ID. No similar matches are shown in this case as the search is specific. The bot will return two buttons (one for merc commander and one for merc units) that can be clicked to show further information tied to the specific mercenary |
| /merc | a | Embed with Quickspears | Since there are other mercenaries with similar names, the bot will shown them in the embed footer. Due to merc embed coming with two buttons, there are no separate buttons for similar matches. If it ever becomes a requested feature, it will be added |
| /merc | hannibal | Embed with Elephant Corps | The bot has a list of commonly used aliases. Aliases also can return similar matches (not in this case). |

## Contributing:
- Raising issues and opening PRs are more than welcome! Feel free to head to the bots main development Discord server to ask questions about how you can contribute: [Discord Server](https://discord.gg/GXgFXjXAaC).