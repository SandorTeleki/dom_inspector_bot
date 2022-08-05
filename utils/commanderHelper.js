const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, COMMANDER_URL, BASE_URL } = require('./utils');
const { commanderAliases } =require('./commanderAliases');
const { similarMatches } =require('./similarMatches');


async function getCommander( commanderName ){
    if (commanderName in commanderAliases){ commanderName = commanderAliases[commanderName] };
    if  (/^\d+$/.test(commanderName)){
        const { body } = await request(BASE_URL + COMMANDER_URL + '/' + encodeURIComponent(commanderName));
        var commanders  = await body.json();
        const commanderEmbed = new MessageEmbed()
            .setTitle(commanders.name)
            //.setDescription('Mentor notes will go here.')
            .setImage(BASE_URL + commanders.screenshot)
        return commanderEmbed;
    }

    else {
        const { body } = await request(BASE_URL + COMMANDER_URL + FUZZY_MATCH_URL + encodeURIComponent(commanderName));
        var { commanders } = await body.json();

        const [commanderAnswer] = commanders;
        const commanderEmbed = new MessageEmbed()
            .setTitle(commanderAnswer.name)
            //.setDescription('Mentor notes will go here.')
            .setImage(BASE_URL + commanderAnswer.screenshot)
            similarMatchesString = similarMatches(commanders);
            if ( similarMatchesString ) {commanderEmbed.setFooter({text: similarMatches(commanders)})};
        return commanderEmbed;
    }; 
}

module.exports = { getCommander }