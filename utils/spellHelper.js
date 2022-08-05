const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, SPELL_URL, BASE_URL } = require('./utils');
const { spellAliases } =require('./spellAliases');
const { similarMatches } =require('./similarMatches');


async function getSpell( spellName ){
    if (spellName in spellAliases){ spellName = spellAliases[spellName] };
    const { body } = await request(BASE_URL + SPELL_URL + FUZZY_MATCH_URL + encodeURIComponent(spellName));
    const { spells } = await body.json();

    const [spellAnswer] = spells;
    const spellEmbed = new MessageEmbed()
        .setTitle(spellAnswer.name)
        //.setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + spellAnswer.screenshot)
        similarMatchesString = similarMatches(spells);
        if ( similarMatchesString ) {spellEmbed.setFooter({text: similarMatches(spells)})};
    return spellEmbed;
}

module.exports = { getSpell }