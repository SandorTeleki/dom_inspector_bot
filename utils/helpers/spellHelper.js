const { EmbedBuilder } = require('discord.js');

const { FUZZY_MATCH_URL, SPELL_URL, BASE_URL } = require('../utils');
// const { mentorWhitelist, channelWhiteList } = require('../whitelist');
const { spellAliases } = require('../aliases/spellAliases');
const { similarMatchesStringify, similarMatchesArray } = require('../similarMatches');
// const { sqlGetMentorNote } = require('../sqlHelper');
const { buttonCreator } = require('../buttonCreator');
const { fetchScreenshot } = require('../fetchScreenshot');
const { fetchApiJson, getEntityList, getFirstEntity } = require('../apiRequest');
const { resolveLookupFailure, notFoundResult } = require('../notFoundResult');

async function getSpell( spellName, spellCommandData ){
    //Messages and interactions use different syntax. Using ternary operator to check if we got info from a message (type = 0) or interaction (type = 2)
    // const channelId = (spellCommandData.type === 0 ? spellCommandData.channelId : spellCommandData.channel.id );
    // const serverId = (spellCommandData.type === 0 ? spellCommandData.guildId : spellCommandData.guild.id );
    
    //----Other useful parts of the message/interaction----//
    // const server = spellCommandData.guild.name;
    // const serverId = spellCommandData.guildId;
    // const channelName = spellCommandData.channel.name;
    // const channelId = spellCommandData.channelId;
    // const user = spellCommandData.author.tag;
    // const userId = spellCommandData.author.id;
    // const text = spellCommandData.content;
    // const unixTimestamp = spellCommandData.createdTimestamp;

    let spell;
    let similarMatchesString;
    let similarMatchesList;
    const regExId = /^(\d+)/;

    if (spellName in spellAliases){
        spellName = spellAliases[spellName];
    };

    if  (spellName.match(regExId)){
        const spellIdMatch = spellName.match(regExId);
        const spellId = spellIdMatch[1];
        const result = await fetchApiJson(BASE_URL + SPELL_URL + '/' + encodeURIComponent(spellId));
        const failure = resolveLookupFailure(result);
        if (failure) {
            return failure;
        }
        spell = getFirstEntity(result.data, 'spells');
        if (!spell) {
            return notFoundResult();
        }
    } else {
        const result = await fetchApiJson(BASE_URL + SPELL_URL + FUZZY_MATCH_URL + encodeURIComponent(spellName));
        const failure = resolveLookupFailure(result);
        if (failure) {
            return failure;
        }
        const spells = getEntityList(result.data, 'spells');
        if (!spells.length) {
            return notFoundResult();
        }
        spell = spells[0];
        similarMatchesString = similarMatchesStringify(spells);
        similarMatchesList = similarMatchesArray(spells);
    }; 
    
    // Building buttons from similarMatchesList
    let buttons = [];
    const buttonPrefix = "spell-";
    if(similarMatchesList){
        buttons = buttonCreator(similarMatchesList, buttonPrefix);
    }

    // let type = "spell";
    // let typeId = spell.id;
    //
    // const row = await sqlGetMentorNote(type, typeId, serverId);
    //
    // // Destructuring the note property from the row object
    // const { note: mentorNote, written_by_user: noteAuthor } = row || {};
    //
    // //console.log("mentorNote: " + mentorNote);

    // Fetch the screenshot as a file attachment so Discord can display it in the embed
    const screenshotFilename = `spell_${spell.id}.png`;
    const attachment = await fetchScreenshot(spell.image, screenshotFilename);

    // Construct the spellEmbed after obtaining the mentorNote value
    const spellEmbed = new EmbedBuilder()
        .setImage(attachment ? `attachment://${screenshotFilename}` : null);

    if (similarMatchesString && similarMatchesString.length < 2048) {
        spellEmbed.setFooter({ text: `Other matches [ID#]:\n${similarMatchesString}` });
    } else if (similarMatchesString && similarMatchesString.length >= 2048) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("Too many matches to display. Try narrowing your search!")
        return [errorEmbed, [], "", []];
    }

    // For prod version, swap channelId for guildId, so mentor notes for one guild are only visible for that guild
    // if (channelWhiteList.some((item)=>{ return item === channelId })) {
    //     spellEmbed.setTitle(`ID: ${spell.id}`);
    //     if(mentorNote !== undefined){
    //         spellEmbed.addFields([
    //             {name: "Mentor scribble:", value: `||${mentorNote}||`, inline: true},
    //             {name: "Written by:", value: noteAuthor, inline: true}
    //         ])        
    //     }
    // }
    const files = attachment ? [attachment] : [];
    return [ spellEmbed, buttons, buttonPrefix, files ];    
}

module.exports = { getSpell }