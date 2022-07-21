const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { COMMANDER_URL, BASE_URL } = require('./utils');
const { commanderAliases } =require('./commanderAliases')

async function getCommander( commanderName ){
    if (commanderName in commanderAliases){ commanderName = commanderAliases[commanderName] };
    const { body } = await request(COMMANDER_URL + encodeURIComponent(commanderName));
    const { commanders } = await body.json();

    const [commanderAnswer] = commanders;
    const commanderEmbed = new MessageEmbed()
        .setTitle(commanderAnswer.name)
        .setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + commanderAnswer.screenshot)
    return commanderEmbed;
}

module.exports = { getCommander }