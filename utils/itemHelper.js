const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { ITEM_URL, BASE_URL } = require('./utils');
const { itemAliases } =require('./itemAliases')

async function getItem( itemName ){
    if (itemName in itemAliases){ itemName = itemAliases[itemName] };
    const { body } = await request(ITEM_URL + encodeURIComponent(itemName));
    const { items } = await body.json();

    const [itemAnswer] = items;
    const itemEmbed = new MessageEmbed()
        .setTitle(itemAnswer.name)
        .setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + itemAnswer.screenshot)
    return itemEmbed;
}

module.exports = { getItem }