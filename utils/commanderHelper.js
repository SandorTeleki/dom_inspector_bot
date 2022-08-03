const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { COMMANDER_URL, BASE_URL } = require('./utils');
const { commanderAliases } =require('./commanderAliases');
const { similarMatches } =require('./similarMatches');


async function getCommander( commanderName ){
    if (commanderName in commanderAliases){ commanderName = commanderAliases[commanderName] };
    const { body } = await request(COMMANDER_URL + encodeURIComponent(commanderName));
    const { commanders } = await body.json();

    const [commanderAnswer] = commanders;
    const commanderEmbed = new MessageEmbed()
        .setTitle(commanderAnswer.name)
        //.setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + commanderAnswer.screenshot)
        similarMatchesString = similarMatches(commanders);
        if ( similarMatchesString ) {commanderEmbed.setFooter({text: similarMatches(commanders)})};
    return commanderEmbed;
}

module.exports = { getCommander }