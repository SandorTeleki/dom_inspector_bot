const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, SPELL_URL, BASE_URL } = require('./utils');
const { spellAliases } =require('./spellAliases');
const { similarMatches } =require('./similarMatches');

async function getSpell( spellName ){
    if (spellName in spellAliases){ spellName = spellAliases[spellName] };
    var spell;
    var similarMatchesString;
    if  (/^\d+$/.test(spellName)){
        const { body } = await request(BASE_URL + SPELL_URL + '/' + encodeURIComponent(spellName));
        spell  = await body.json();
    }

    else {
        const { body } = await request(BASE_URL + SPELL_URL + FUZZY_MATCH_URL + encodeURIComponent(spellName));
        var { spells } = await body.json();
        spell = spells[0];
        similarMatchesString = similarMatches(spells);
    }; 
    const spellEmbed = new MessageEmbed()
        //.setTitle(spell.name)
        //.setDescription('Mentor notes will go here.')
        .setImage(BASE_URL + spell.screenshot);
    if ( similarMatchesString ) {spellEmbed.setFooter({text: similarMatchesString})};
    return spellEmbed;
}

module.exports = { getSpell }