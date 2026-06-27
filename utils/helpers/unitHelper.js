const { EmbedBuilder } = require('discord.js');

const { FUZZY_MATCH_URL, UNIT_URL, BASE_URL } = require('../utils');
// const { mentorWhitelist, channelWhiteList } = require('../whitelist');
const { unitAliases } = require('../aliases/unitAliases');
const { similarMatchesStringify, similarMatchesStringifyNoSlice, similarMatchesArray } = require('../similarMatches');
// const { sqlGetMentorNote } = require('../sqlHelper');
const { buttonCreator } = require('../buttonCreator');
const { fetchScreenshot } = require('../fetchScreenshot');
const { fetchApiJson, getEntityList, getFirstEntity } = require('../apiRequest');
const { resolveLookupFailure, notFoundResult, screenshotMissingResult } = require('../notFoundResult');

function applyUnitMatches(units, size) {
    let similarMatchesString;
    let similarMatchesList;
    let selectedUnit;

    const sizeMatch = units.filter(function(unit) {
        return +unit.size === +size;
    });
    const correctSize = sizeMatch[0];

    if (correctSize) {
        selectedUnit = correctSize;
        const index = units.indexOf(correctSize);
        if (index > -1) {
            units.splice(index, 1);
        }
        similarMatchesString = similarMatchesStringifyNoSlice(units);
        similarMatchesList = units;
    } else {
        selectedUnit = units[0];
        similarMatchesString = similarMatchesStringify(units);
        similarMatchesList = similarMatchesArray(units);
    }

    return { unit: selectedUnit, similarMatchesString, similarMatchesList };
}

async function getUnit( unitName, unitCommandData ){
    //Messages and interactions use different syntax. Using ternary operator to check if we got info from a message (type = 0) or interaction (type = 2)
    // const channelId = (unitCommandData.type === 0 ? unitCommandData.channelId : unitCommandData.channel.id );
    // const serverId = (unitCommandData.type === 0 ? unitCommandData.guildId : unitCommandData.guild.id );
    
    //----Other useful parts of the message/interaction----//
    //const server = unitCommandData.guild.name;
    //const serverId = unitCommandData.guildId;
    //const channelName = unitCommandData.channel.name;
    //const channelId = unitCommandData.channelId;
    //const user = unitCommandData.author.tag;
    //const userId = unitCommandData.author.id;
    //const text = unitCommandData.content;
    //const unixTimestamp = unitCommandData.createdTimestamp;
    let unit;
    let similarMatchesString;
    let similarMatchesList;
    let footerStrings = ' ';

    const regExId = /^(\d+)/;
    const regExSize = /^.[^0-9]+\s?(\d)/;
    const regExSplit = /^([a-z]+)\s?(\d)/;

    if (unitName in unitAliases){
        unitName = unitAliases[unitName];
    };

    //Running for size filtering (w/ fuzzy match) for aliased stuff
    if (unitName.match(regExSplit)){
        let edgecase = unitName.match(regExSplit);
        let text = edgecase[1];
        let size2 = edgecase[2];
        if (text in unitAliases){ text = unitAliases[text] };
        const result = await fetchApiJson(BASE_URL + UNIT_URL + FUZZY_MATCH_URL + encodeURIComponent(text));
        const failure = resolveLookupFailure(result);
        if (failure) {
            return failure;
        }
        const units = getEntityList(result.data, 'units');
        if (!units.length) {
            return notFoundResult();
        }
        ({ unit, similarMatchesString, similarMatchesList } = applyUnitMatches(units, size2));

    //Running it for ID
    } else if (unitName.match(regExId)){
        const unitIdMatch = unitName.match(regExId);
        const unitId = unitIdMatch[1];
        const result = await fetchApiJson(BASE_URL + UNIT_URL + '/' + encodeURIComponent(unitId));
        const failure = resolveLookupFailure(result);
        if (failure) {
            return failure;
        }
        unit = getFirstEntity(result.data, 'units');
        if (!unit) {
            return notFoundResult();
        }
    //Running for everything else (w/ Fuzzy match)
    } else {
        const regExSizeMatch = unitName.match(regExSize);
        const size = (regExSizeMatch ? regExSizeMatch[1] : undefined);
        const result = await fetchApiJson(BASE_URL + UNIT_URL + FUZZY_MATCH_URL + encodeURIComponent(unitName));
        const failure = resolveLookupFailure(result);
        if (failure) {
            return failure;
        }
        const units = getEntityList(result.data, 'units');
        if (!units.length) {
            return notFoundResult();
        }
        ({ unit, similarMatchesString, similarMatchesList } = applyUnitMatches(units, size));
    };

    // Building buttons from similarMatchesList
    let buttons = [];
    const buttonPrefix = "unit-";
    if (similarMatchesList){
        buttons = buttonCreator(similarMatchesList, buttonPrefix);
    }

    // const type = "unit";
    // let typeId = unit.id;
    //
    // const row = await sqlGetMentorNote(type, typeId, serverId);
    //
    // // Destructuring the note property from the row object
    // const { note: mentorNote, written_by_user: noteAuthor } = row || {};
    //
    // //console.log("Mentor note: " + mentorNote);

    // Fetch the screenshot as a file attachment so Discord can display it in the embed
    const screenshotFilename = `unit_${unit.id}.png`;
    const attachment = await fetchScreenshot(unit.image, screenshotFilename);

    if (!attachment) {
        return screenshotMissingResult();
    }

    // Construct the unitEmbed after obtaining the mentorNote value
    const unitEmbed = new EmbedBuilder()
        .setImage(`attachment://${screenshotFilename}`);

    if (unit.randompaths !== undefined){
        for ( const randompath of unit.randompaths ) {
            footerStrings += ( randompath.chance + '%' + ' of' + ' +' + randompath.levels + ' ' + randompath.paths+ ' ' +  "\n");
        }
    }

    if (similarMatchesString && similarMatchesString.length < 2048) {
        unitEmbed.setFooter({text: footerStrings + `Other matches [ID#]:\n${similarMatchesString}`})
    } else if (footerStrings.length > 1) {
        unitEmbed.setFooter({ text: footerStrings });
    } else if (similarMatchesString && similarMatchesString.length >= 2048) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("Too many matches to display. Try narrowing your search!")
        return [errorEmbed, [], "", []];
    }
    ;
    // For prod version, swap channelId for guildId, so mentor notes for one guild are only visible for that guild
    // if (channelWhiteList.some((item)=>{ return item === channelId })) {
    //     unitEmbed.setTitle(`ID: ${unit.id}`);
    //     if(mentorNote !== undefined){
    //         unitEmbed.addFields([
    //             {name: "Mentor scribble:", value: `||${mentorNote}||`, inline: true},
    //             {name: "Written by:", value: noteAuthor, inline: true}
    //         ])
    //     }
    // }  
    const files = attachment ? [attachment] : [];
    return [ unitEmbed, buttons, buttonPrefix, files ];
}

module.exports = { getUnit }