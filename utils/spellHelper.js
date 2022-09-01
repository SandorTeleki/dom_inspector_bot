const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, SPELL_URL, BASE_URL } = require('./utils');
const { aliases } = require('./aliases')
const { similarMatches } =require('./similarMatches');

async function getSpell( spellName ){
    if (spellName in aliases.spell){ spellName = aliases.spell[spellName] };
    let spell;
    let similarMatchesString;
    if  (/^\d+$/.test(spellName)){
        const { body, statusCode } = await request(BASE_URL + SPELL_URL + '/' + encodeURIComponent(spellName));
        if (statusCode === 404){
            const errorEmbed = new MessageEmbed()
            .setTitle("Nothing found. Better luck next time!")
            .setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            return errorEmbed;
        }
        spell  = await body.json();
    }

    else {
        const { body } = await request(BASE_URL + SPELL_URL + FUZZY_MATCH_URL + encodeURIComponent(spellName));
        let { spells } = await body.json();
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