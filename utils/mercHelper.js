const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, MERC_URL, BASE_URL } = require('./utils');
const { mercAliases } =require('./mercAliases');
const { similarMatches } =require('./similarMatches');


async function getMerc( mercName ){
    if (mercName in mercAliases){ mercName = mercAliases[mercName] };
    const { body } = await request(BASE_URL + MERC_URL + FUZZY_MATCH_URL + encodeURIComponent(mercName));
    const { mercs } = await body.json();

    const [mercAnswer] = mercs;
    const mercEmbed = new MessageEmbed()
        .setTitle(mercAnswer.name)
        // .setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + mercAnswer.screenshot)
        similarMatchesString = similarMatches(mercs);
        if ( similarMatchesString ) {mercEmbed.setFooter({text: similarMatches(mercs)})};
    const mercLeaderEmbed = new MessageEmbed()
        .setImage(BASE_URL+'/commanders/'+ mercAnswer.commander_id+'/screenshot')
        .setDescription('Name of mercenary group leader: '+ mercAnswer.bossname)
    const mercTroopEmbed = new MessageEmbed()
        .setImage(BASE_URL+'/commanders/'+ mercAnswer.unit_id+'/screenshot')
        .setDescription('Number of units: '+ mercAnswer.nrunits)
    // return mercEmbed;
    return [mercEmbed, mercLeaderEmbed, mercTroopEmbed];
    
}

module.exports = { getMerc }