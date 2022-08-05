const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, UNIT_URL, BASE_URL } = require('./utils');
const { unitAliases } =require('./unitAliases');
const { similarMatches } =require('./similarMatches');

async function getUnit( unitName ){
    if (unitName in unitAliases){ unitName = unitAliases[unitName] };
    var unit;
    var similarMatchesString;
    if  (/^\d+$/.test(unitName)){
        const { body } = await request(BASE_URL + UNIT_URL + '/' + encodeURIComponent(unitName));
        unit  = await body.json();
    }

    else {
        const { body } = await request(BASE_URL + UNIT_URL + FUZZY_MATCH_URL + encodeURIComponent(unitName));
        var { units } = await body.json();
        unit = units[0];
        similarMatchesString = similarMatches(units);
    }; 
    const unitEmbed = new MessageEmbed()
        .setTitle(unit.name)
        //.setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + unit.screenshot);
    if ( similarMatchesString ) {unitEmbed.setFooter({text: similarMatchesString})};
    return unitEmbed;
}

module.exports = { getUnit }