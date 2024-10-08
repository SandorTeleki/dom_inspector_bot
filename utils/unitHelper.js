const { EmbedBuilder } = require('discord.js');
const { request } = require('undici');

const { FUZZY_MATCH_URL, UNIT_URL, BASE_URL } = require('./utils');
const { mentorWhitelist, channelWhiteList } = require('./whitelist');
const { unitAliases } = require('./unitAliases');
const { similarMatchesStringify, similarMatchesStringifyNoSlice, similarMatchesArray } = require('./similarMatches');
const { sqlGetMentorNote } = require('./sqlHelper');
const { buttonCreator } = require('./buttonCreator');

async function getUnit( unitName, unitCommandData ){
    //Messages and interactions use different synthax. Using ternary operator to check if we got info from a message (type = 0) or interaction (type = 2)
    const channelId = (unitCommandData.type === 0 ? unitCommandData.channelId : unitCommandData.channel.id );
    const serverId = (unitCommandData.type === 0 ? unitCommandData.guildId : unitCommandData.guild.id );
    
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

    if (unitName in unitAliases){ unitName = unitAliases[unitName] };
    //Running for size filtering (w/ fuzzy match) for aliased stuff
    if (unitName.match(regExSplit)){
        let edgecase = unitName.match(regExSplit);
        let text = edgecase[1];
        let size2 = edgecase[2];
        if (text in unitAliases){ text = unitAliases[text] };
        const { body } = await request(BASE_URL + UNIT_URL + FUZZY_MATCH_URL + encodeURIComponent(text));
        let { units } = await body.json();
        let sizeMatch = units.filter(function(unit){
            let unitSize = unit.size;
            return +unitSize === +size2;
        })
        const correctSize = sizeMatch[0];
        //If there is a correct size, remove correct size from array
        if (correctSize) {
            unit = correctSize;
            const index = units.indexOf(correctSize);
            if (index > -1){
                units.splice(index, 1);
            }
            similarMatchesString = similarMatchesStringifyNoSlice(units);
            similarMatchesList = units;
        //If there is no correct size, then just remove first value from array
        } else {
            unit = units[0];
            similarMatchesString = similarMatchesStringify(units);
            similarMatchesList = similarMatchesArray(units);
        }

    //Running it for ID
    } else if (unitName.match(regExId)){
        const unitIdMatch = unitName.match(regExId);
        const unitId = unitIdMatch[1];
        const { body, statusCode } = await request(BASE_URL + UNIT_URL + '/' + encodeURIComponent(unitId));
        if (statusCode === 404){
            const errorEmbed = new EmbedBuilder()
            .setTitle("Nothing found. Better luck next time!")
            .setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            return errorEmbed;
        }
        unit  = await body.json();
    //Running for everything else (w/ Fuzzy match)
    } else {
        const regExSizeMatch = unitName.match(regExSize);
        const size = (regExSizeMatch ? regExSizeMatch[1] : undefined);
        const { body } = await request(BASE_URL + UNIT_URL + FUZZY_MATCH_URL + encodeURIComponent(unitName));
        let { units } = await body.json();
        let sizeMatch = units.filter(function(unit){
            let unitSize = unit.size;
            return +unitSize === +size;
        })
        const correctSize = sizeMatch[0];
        //If there is a correct size, remove correct size from array
        if (correctSize) {
            unit = correctSize;
            const index = units.indexOf(correctSize);
            if (index > -1){
                units.splice(index, 1);
            }
            similarMatchesString = similarMatchesStringifyNoSlice(units);
            similarMatchesList = units;
        //If there is no correct size, then just remove first value from array
        } else {
            unit = units[0];
            similarMatchesString = similarMatchesStringify(units);
            similarMatchesList = similarMatchesArray(units);
        }
    };

    // Building buttons from similarMatchesList
    let buttons = [];
    const buttonPrefix = "unit-";
    if(similarMatchesList){
        buttons = buttonCreator(similarMatchesList, buttonPrefix);
    }

    const type = "unit";
    let typeId = unit.id;

    const row = await sqlGetMentorNote(type, typeId, serverId);

    // Destructuring the note property from the row object
    const { note: mentorNote, written_by_user: noteAuthor } = row || {};

    //console.log("Mentor note: " + mentorNote);

    // Construct the unitEmbed after obtaining the mentorNote value
    const unitEmbed = new EmbedBuilder()
        .setImage(BASE_URL + unit.screenshot);

    if (unit.randompaths !== undefined){
        for ( const randompath of unit.randompaths ) {
            footerStrings += ( randompath.chance + '%' + ' of' + ' +' + randompath.levels + ' ' + randompath.paths+ ' ' +  "\n");
        }
    }

    if ( similarMatchesString ) {
        unitEmbed.setFooter({text: footerStrings + `Other matches [ID#]:\n${similarMatchesString}`})
    } else {
        unitEmbed.setFooter({ text: footerStrings });
    };
    // For prod version, swap channelId for guildId, so mentor notes for one guild are only visible for that guild
    if (channelWhiteList.some((item)=>{ return item === channelId })) {
        unitEmbed.setTitle(`ID: ${unit.id}`);
        if(mentorNote !== undefined){
            unitEmbed.addFields([
                {name: "Mentor scribble:", value: `||${mentorNote}||`, inline: true},
                {name: "Written by:", value: noteAuthor, inline: true}
            ])
        }
    }  
    return [ unitEmbed, buttons, buttonPrefix ];
}

module.exports = { getUnit }