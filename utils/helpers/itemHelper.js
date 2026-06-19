const { EmbedBuilder } = require('discord.js');

const { FUZZY_MATCH_URL, ITEM_URL, BASE_URL } = require('../utils');
// const { mentorWhitelist, channelWhiteList } = require('../whitelist');
const { itemAliases } = require('../aliases/itemAliases');
const { similarMatchesStringify, similarMatchesArray } =require('../similarMatches');
// const { sqlGetMentorNote } = require('../sqlHelper');
const { buttonCreator } = require('../buttonCreator');
const { fetchScreenshot } = require('../fetchScreenshot');
const { fetchApiJson, getEntityList, getFirstEntity } = require('../apiRequest');
const { notFoundResult, apiErrorResult } = require('../notFoundResult');

async function getItem( itemName, itemCommandData ){
    //Messages and interactions use different syntax. Using ternary operator to check if we got info from a message (type = 0) or interaction (type = 2)
    // const channelId = (itemCommandData.type === 0 ? itemCommandData.channelId : itemCommandData.channel.id );
    // const serverId = (itemCommandData.type === 0 ? itemCommandData.guildId : itemCommandData.guild.id );
    
    //----Other useful parts of the message/interaction----//
    // const server = itemCommandData.guild.name;
    // const serverId = itemCommandData.guildId;
    // const channelName = itemCommandData.channel.name;
    // const channelId = itemCommandData.channelId;
    // const user = itemCommandData.author.tag;
    // const userId = itemCommandData.author.id;
    // const text = itemCommandData.content;
    // const unixTimestamp = itemCommandData.createdTimestamp;

    let item;
    let similarMatchesString;
    let similarMatchesList;
    const regExId = /^(\d+)/;

    if (itemName in itemAliases){ 
        itemName = itemAliases[itemName] 
    };

    if  (itemName.match(regExId)){
        const itemIdMatch = itemName.match(regExId);
        const itemId = itemIdMatch[1];
        const result = await fetchApiJson(BASE_URL + ITEM_URL + '/' + encodeURIComponent(itemId));
        if (result.notFound) {
            return notFoundResult();
        }
        if (!result.ok) {
            return apiErrorResult();
        }
        item = getFirstEntity(result.data, 'items');
        if (!item) {
            return notFoundResult();
        }
    } else {
        const result = await fetchApiJson(BASE_URL + ITEM_URL + FUZZY_MATCH_URL + encodeURIComponent(itemName));
        if (result.notFound) {
            return notFoundResult();
        }
        if (!result.ok) {
            return apiErrorResult();
        }
        const items = getEntityList(result.data, 'items');
        if (!items.length) {
            return notFoundResult();
        }
        item = items[0];
        similarMatchesString = similarMatchesStringify(items);
        similarMatchesList = similarMatchesArray(items);
    };

    // Building buttons from similarMatchesList
    let buttons = [];
    const buttonPrefix = "item-";
    if (similarMatchesList){
        buttons = buttonCreator(similarMatchesList, buttonPrefix);
    }

    // let type = "item";
    // let typeId = item.id;
    //
    // const row = await sqlGetMentorNote(type, typeId, serverId);
    //
    // // Destructuring the note property from the row object
    // const { note: mentorNote, written_by_user: noteAuthor } = row || {};
    //
    // //console.log("mentorNote: " + mentorNote);

    // Fetch the screenshot as a file attachment so Discord can display it in the embed
    const screenshotFilename = `item_${item.id}.png`;
    const attachment = await fetchScreenshot(item.image, screenshotFilename);

    // Construct the itemEmbed after obtaining the mentorNote value
    const itemEmbed = new EmbedBuilder()
        .setImage(attachment ? `attachment://${screenshotFilename}` : null);


    if (similarMatchesString && similarMatchesString.length < 2048) {
        itemEmbed.setFooter({ text: `Other matches [ID#]:\n${similarMatchesString}` });
    } else if (similarMatchesString && similarMatchesString.length >= 2048) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("Too many matches to display. Try narrowing your search!")
        return [errorEmbed, [], "", []];
    }

    // For prod version, swap channelId for guildId, so mentor notes for one guild are only visible for that guild
    // if (channelWhiteList.some((item)=>{ return item === channelId })) {
    //     itemEmbed.setTitle(`ID: ${item.id}`);
    //     if(mentorNote !== undefined){
    //         itemEmbed.addFields([
    //             {name: "Mentor scribble:", value: `||${mentorNote}||`, inline: true},
    //             {name: "Written by:", value: noteAuthor, inline: true}
    //         ])
    //     }
    // }
    
    const files = attachment ? [attachment] : [];
    return [ itemEmbed, buttons, buttonPrefix, files ];
 
}

module.exports = { getItem }