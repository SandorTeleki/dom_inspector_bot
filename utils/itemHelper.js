const { MessageEmbed, Message } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, ITEM_URL, BASE_URL } = require('./utils');
const { aliases } = require('./aliases')
const { similarMatches } =require('./similarMatches');

async function getEntity(entityName ){
    if (entityName in aliases.item){ entityName = aliases.item[entityName] };
    let item;
    let similarMatchesString;
    if  (/^\d+$/.test(entityName)){
        const { statusCode, body } = await request(BASE_URL + ITEM_URL + '/' + encodeURIComponent(entityName));
        console.log('statusCode', statusCode);
        if (statusCode === 404){
            const errorEmbed = new MessageEmbed()
            .setTitle("Nothing found. Better luck next time!")
            .setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            return errorEmbed;
        }
        item  = await body.json();
    }

    else {
        const { body } = await request(BASE_URL + ITEM_URL + FUZZY_MATCH_URL + encodeURIComponent(entityName));
        let { items } = await body.json();
        item = items[0];
        similarMatchesString = similarMatches(items);
    }; 
    const itemEmbed = new MessageEmbed()
        //.setTitle(item.name)
        //.setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + item.screenshot);
    if ( similarMatchesString ) {itemEmbed.setFooter({text: similarMatchesString})};
    return itemEmbed;
}

module.exports = { getEntity }