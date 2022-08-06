const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, COMMANDER_URL, BASE_URL } = require('./utils');
const { commanderAliases } =require('./commanderAliases');
const { similarMatches } =require('./similarMatches');

async function getCommander( commanderName ){
    if (commanderName in commanderAliases){ commanderName = commanderAliases[commanderName] };
    var commander;
    var similarMatchesString;
    if  (/^\d+$/.test(commanderName)){
        const { body } = await request(BASE_URL + COMMANDER_URL + '/' + encodeURIComponent(commanderName));
        // console.log('status code: ', statusCode);
        // returnStatus = statusCode.json();
        // console.log('return status: ', returnStatus);
        commander  = await body.json();
    }

    else {
        const { body } = await request(BASE_URL + COMMANDER_URL + FUZZY_MATCH_URL + encodeURIComponent(commanderName));
        var { commanders } = await body.json();
        commander = commanders[0];
        similarMatchesString = similarMatches(commanders);
    }; 
    const commanderEmbed = new MessageEmbed()
        //.setTitle(commander.name)
        //.setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + commander.screenshot);
    if ( similarMatchesString ) {commanderEmbed.setFooter({text: similarMatchesString})};
    return commanderEmbed;
}

module.exports = { getCommander }