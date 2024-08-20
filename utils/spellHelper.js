const { EmbedBuilder } = require('discord.js');
const { request } = require('undici');

const { FUZZY_MATCH_URL, SPELL_URL, BASE_URL } = require('./utils');
const { mentorWhitelist, channelWhiteList } = require('./whitelist');
const { spellAliases } = require('./spellAliases');
const { similarMatchesStringify, similarMatchesArray } = require('./similarMatches');
const { sqlGetMentorNote } = require('./sqlHelper');
const { buttonCreator } = require('./buttonCreator');

async function getSpell( spellName, spellCommandData ){
    //Messages and interactions use different synthax. Using ternary operator to check if we got info from a message (type = 0) or interaction (type = 2)
    const channelId = (spellCommandData.type === 0 ? spellCommandData.channelId : spellCommandData.channel.id );
    const serverId = (spellCommandData.type === 0 ? spellCommandData.guildId : spellCommandData.guild.id );
    
    //----Other useful parts of the message/interaction----//
    // const server = spellCommandData.guild.name;
    // const serverId = spellCommandData.guildId;
    // const channelName = spellCommandData.channel.name;
    // const channelId = spellCommandData.channelId;
    // const user = spellCommandData.author.tag;
    // const userId = spellCommandData.author.id;
    // const text = spellCommandData.content;
    // const unixTimestamp = spellCommandData.createdTimestamp;

    if (spellName in spellAliases){ spellName = spellAliases[spellName] };
    var spell;
    var similarMatchesString;
    var similarMatchesList;
    const regExId = /^(\d+)/;

    if  (spellName.match(regExId)){
        const spellIdMatch = spellName.match(regExId);
        const spellId = spellIdMatch[1];
        const { body, statusCode } = await request(BASE_URL + SPELL_URL + '/' + encodeURIComponent(spellId));
        if (statusCode === 404){
            const errorEmbed = new EmbedBuilder()
            .setTitle("Nothing found. Better luck next time!")
            .setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            return errorEmbed;
        }
        spell  = await body.json();
    } else {
        const { body } = await request(BASE_URL + SPELL_URL + FUZZY_MATCH_URL + encodeURIComponent(spellName));
        var { spells } = await body.json();
        spell = spells[0];
        similarMatchesString = similarMatchesStringify(spells);
        var similarMatchesList = similarMatchesArray(spells);
    }; 
    
    // Building buttons from similarMatchesList
    let buttons = [];
    const buttonPrefix = "spell-";
    if(similarMatchesList){
        buttons = buttonCreator(similarMatchesList, buttonPrefix);
    }

    var type = "spell";
    var typeId = spell.id;

    const row = await sqlGetMentorNote(type, typeId, serverId);

    // Destructuring the note property from the row object
    const { note: mentorNote, written_by_user: noteAuthor } = row || {};

    //console.log("mentorNote: " + mentorNote);

    // Construct the spellEmbed after obtaining the mentorNote value
    const spellEmbed = new EmbedBuilder()
        .setImage(BASE_URL + spell.screenshot);

    if (similarMatchesString) {
        spellEmbed.setFooter({ text: `Other matches [ID#]:\n${similarMatchesString}` });
    }
    // For prod version, swap channelId for guildId, so mentor notes for one guild are only visible for that guild
    if (channelWhiteList.some((item)=>{ return item === channelId })) {
        spellEmbed.setTitle(`ID: ${spell.id}`);
        if(mentorNote !== undefined){
            spellEmbed.addFields([
                {name: "Mentor scribble:", value: `||${mentorNote}||`, inline: true},
                {name: "Written by:", value: noteAuthor, inline: true}
            ])        
        }
    }
    return [ spellEmbed, buttons, buttonPrefix ];    
}

module.exports = { getSpell }