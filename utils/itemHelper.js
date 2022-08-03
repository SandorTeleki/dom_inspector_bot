const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { ITEM_URL, BASE_URL } = require('./utils');
const { itemAliases } = require('./itemAliases')
const { similarMatches } =require('./similarMatches')

async function getItem( itemName ){
    if (itemName in itemAliases){ itemName = itemAliases[itemName] };
    const { body } = await request(ITEM_URL + encodeURIComponent(itemName));
    const { items } = await body.json();

    const [itemAnswer] = items;
    const itemEmbed = new MessageEmbed()
        .setTitle(itemAnswer.name)
        .setImage(BASE_URL + itemAnswer.screenshot)
        .setFooter({text:`Other matches:\n${similarMatches(items)}`})
        //if (items.length > 1) itemEmbed.setFooter(`Other matches:\n${items.slice(1).map(function(i){return i.name}).join(", ")}`);
    return itemEmbed;
}

module.exports = { getItem }