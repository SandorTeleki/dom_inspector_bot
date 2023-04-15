const { EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, UNIT_URL, BASE_URL } = require('./utils');
const { unitAliases } =require('./unitAliases');
const { similarMatches } =require('./similarMatches');

async function getUnit( unitName ){
    if (unitName in unitAliases){ unitName = unitAliases[unitName] };
    var unit;
    var similarMatchesString;
    var footerStrings = ' ';
    if  (/^\d+$/.test(unitName)){
        const { body, statusCode } = await request(BASE_URL + UNIT_URL + '/' + encodeURIComponent(unitName));
        if (statusCode === 404){
            const errorEmbed = new EmbedBuilder()
            .setTitle("Nothing found. Better luck next time!")
            .setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            return errorEmbed;
        }
        unit  = await body.json();
    }
    else {
        const { body } = await request(BASE_URL + UNIT_URL + FUZZY_MATCH_URL + encodeURIComponent(unitName));
        var { units } = await body.json();
        unit = units[0];
        similarMatchesString = similarMatches(units);  
    }; 
    const unitEmbed = new EmbedBuilder()
        //.setTitle(unit.name)
        //.setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + unit.screenshot)
        if (unit.randompaths !== undefined){
            for ( const randompath of unit.randompaths ) {
                footerStrings += ( randompath.chance + '%' + ' of' + ' +' + randompath.levels + ' ' + randompath.paths+ ' ' +  "\n");
            }
        }
  
        if ( similarMatchesString ) {
            unitEmbed.setFooter({text: footerStrings + similarMatchesString})
        }
        else {
            unitEmbed.setFooter({ text: footerStrings });
        };
        
        
    return unitEmbed;
}

module.exports = { getUnit }