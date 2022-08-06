const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, ITEM_URL, BASE_URL } = require('./utils');
const { itemAliases } = require('./itemAliases');
const { similarMatches } =require('./similarMatches');

async function getItem( itemName ){
    if (itemName in itemAliases){ itemName = itemAliases[itemName] };
    var item;
    var similarMatchesString;
    if  (/^\d+$/.test(itemName)){
        const { body } = await request(BASE_URL + ITEM_URL + '/' + encodeURIComponent(itemName));
        item  = await body.json();
    }

    else {
        const { body } = await request(BASE_URL + ITEM_URL + FUZZY_MATCH_URL + encodeURIComponent(itemName));
        var { items } = await body.json();
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

module.exports = { getItem }