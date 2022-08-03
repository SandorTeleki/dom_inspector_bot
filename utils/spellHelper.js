const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { SPELL_URL, BASE_URL } = require('./utils');
const { spellAliases } =require('./spellAliases');
const { similarMatches } =require('./similarMatches');


async function getSpell( spellName ){
    if (spellName in spellAliases){ spellName = spellAliases[spellName] };
    const { body } = await request(SPELL_URL + encodeURIComponent(spellName));
    const { spells } = await body.json();

    const [spellAnswer] = spells;
    const spellEmbed = new MessageEmbed()
        .setTitle(spellAnswer.name)
        //.setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + spellAnswer.screenshot)
        .setFooter({text:`Other matches:\n${similarMatches(spells)}`})
    return spellEmbed;
}

module.exports = { getSpell }