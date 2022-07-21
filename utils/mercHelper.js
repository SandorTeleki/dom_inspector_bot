const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { MERC_URL, BASE_URL } = require('./utils');
const { mercAliases } =require('./mercAliases')

async function getMerc( mercName ){
    if (mercName in mercAliases){ mercName = mercAliases[mercName] };
    const { body } = await request(MERC_URL + encodeURIComponent(mercName));
    const { mercs } = await body.json();

    const [mercAnswer] = mercs;
    const mercEmbed = new MessageEmbed()
        .setTitle(mercAnswer.name)
        .setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + mercAnswer.screenshot)
    // const mercLeaderEmbed = new MessageEmbed()
    //     .setImage(BASE_URL+'/commanders/'+ mercAnswer.commander_id+'/screenshot')
    //     .setDescription('Name of mercenary group leader: '+ mercAnswer.bossname)
    // const mercTroopEmbed = new MessageEmbed()
    //     .setImage(BASE_URL+'/commanders/'+ mercAnswer.unit_id+'/screenshot')
    //     .setDescription('Number of units: '+ mercAnswer.nrunits)
    return mercEmbed;
    //return [mercEmbed, mercLeaderEmbed, mercTroopEmbed];
    
}

module.exports = { getMerc }