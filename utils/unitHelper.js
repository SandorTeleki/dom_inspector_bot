const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, UNIT_URL, BASE_URL } = require('./utils');
const { unitAliases } =require('./unitAliases');
const { similarMatches } =require('./similarMatches');

async function getUnit( unitName ){
    if (unitName in unitAliases){ unitName = unitAliases[unitName] };
    if  (/^\d+$/.test(unitName)){
        const { body } = await request(BASE_URL + UNIT_URL + '/' + encodeURIComponent(unitName));
        var units  = await body.json();
        const unitEmbed = new MessageEmbed()
            .setTitle(units.name)
            //.setDescription('Mentor notes will go here.')
            .setImage(BASE_URL + units.screenshot)
        return unitEmbed;
    }

    else {
        const { body } = await request(BASE_URL + UNIT_URL + FUZZY_MATCH_URL + encodeURIComponent(unitName));
        var { units } = await body.json();

        const [unitAnswer] = units;
        const unitEmbed = new MessageEmbed()
            .setTitle(unitAnswer.name)
            //.setDescription('Mentor notes will go here.')
            .setImage(BASE_URL + unitAnswer.screenshot)
            similarMatchesString = similarMatches(units);
            if ( similarMatchesString ) {unitEmbed.setFooter({text: similarMatches(units)})};
        return unitEmbed;
    }; 
}

module.exports = { getUnit }