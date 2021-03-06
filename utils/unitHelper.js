const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { UNIT_URL, BASE_URL } = require('./utils');
const { unitAliases } =require('./unitAliases')

async function getUnit( unitName ){
    if (unitName in unitAliases){ unitName = unitAliases[unitName] };
    const { body } = await request(UNIT_URL + encodeURIComponent(unitName));
    const { units } = await body.json();

    const [unitAnswer] = units;
    const unitEmbed = new MessageEmbed()
        .setTitle(unitAnswer.name)
        .setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + unitAnswer.screenshot)
    return unitEmbed;
}

module.exports = { getUnit }