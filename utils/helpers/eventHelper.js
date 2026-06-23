const { EmbedBuilder } = require('discord.js');

const { FUZZY_MATCH_URL, EVENT_URL, BASE_URL } = require('../utils');
// const { mentorWhitelist, channelWhiteList } = require('../whitelist');
const { eventAliases } = require('../aliases/eventAliases');
const { similarMatchesStringify, similarMatchesArray } =require('../similarMatches');
// const { sqlGetMentorNote } = require('../sqlHelper');
const { buttonCreator } = require('../buttonCreator');
const { fetchScreenshot } = require('../fetchScreenshot');
const { fetchApiJson, getEntityList, getFirstEntity } = require('../apiRequest');
const { resolveLookupFailure, notFoundResult } = require('../notFoundResult');

async function getEvent( eventName, eventCommandData ){
    //Messages and interactions use different syntax. Using ternary operator to check if we got info from a message (type = 0) or interaction (type = 2)
    // const channelId = (eventCommandData.type === 0 ? eventCommandData.channelId : eventCommandData.channel.id );
    // const serverId = (eventCommandData.type === 0 ? eventCommandData.guildId : eventCommandData.guild.id );
    
    //----Other useful parts of the message/interaction----//
    // const server = eventCommandData.guild.name;
    // const serverId = eventCommandData.guildId;
    // const channelName = eventCommandData.channel.name;
    // const channelId = eventCommandData.channelId;
    // const user = eventCommandData.author.tag;
    // const userId = eventCommandData.author.id;
    // const text = eventCommandData.content;
    // const unixTimestamp = eventCommandData.createdTimestamp;
    
    let event;
    let similarMatchesString;
    let similarMatchesList;
    const regExId = /^(\d+)/;

    if (eventName in eventAliases){ 
        eventName = eventAliases[eventName];
    };

    if  (eventName.match(regExId)){
        const eventIdMatch = eventName.match(regExId);
        const eventId = eventIdMatch[1];
        const result = await fetchApiJson(BASE_URL + EVENT_URL + '/' + encodeURIComponent(eventId));
        const failure = resolveLookupFailure(result);
        if (failure) {
            return failure;
        }
        event = getFirstEntity(result.data, 'events');
        if (!event) {
            return notFoundResult();
        }
    } else {
        const result = await fetchApiJson(BASE_URL + EVENT_URL + FUZZY_MATCH_URL + encodeURIComponent(eventName));
        const failure = resolveLookupFailure(result);
        if (failure) {
            return failure;
        }
        const events = getEntityList(result.data, 'events');
        if (!events.length) {
            return notFoundResult();
        }
        event = events[0];
        similarMatchesString = similarMatchesStringify(events);
        similarMatchesList = similarMatchesArray(events);
    }; 

    // Building buttons from similarMatchesList
    let buttons = [];
    const buttonPrefix = "event-";
    if (similarMatchesList) {
        buttons = buttonCreator(similarMatchesList, buttonPrefix);
    }

    // Fetch the screenshot as a file attachment so Discord can display it in the embed
    const screenshotFilename = `event_${event.id}.png`;
    const attachment = await fetchScreenshot(event.image, screenshotFilename);

    // Construct the eventEmbed after obtaining the mentorNote value
    const eventEmbed = new EmbedBuilder()
        .setImage(attachment ? `attachment://${screenshotFilename}` : null);

    if (similarMatchesString && similarMatchesString.length < 2048) {
        eventEmbed.setFooter({ text: `Other matches [ID#]:\n${similarMatchesString}` });
    } else if (similarMatchesString && similarMatchesString.length >= 2048) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("Too many matches to display. Try narrowing your search!")
        return [errorEmbed, [], "", []];
    }

    // let type = "event";
    // let typeId = event.id;
    //
    // const row = await sqlGetMentorNote(type, typeId, serverId);
    //
    // // Destructuring the note property from the row object
    // const { note: mentorNote, written_by_user: noteAuthor } = row || {};
    // //console.log("mentorNote: " + mentorNote);
    //
    // // For prod version, swap channelId for guildId, so mentor notes for one guild are only visible for that guild
    // if (channelWhiteList.some((item)=>{ return item === channelId })) {
    //     eventEmbed.setTitle(`ID: ${event.id}`);
    //     if(mentorNote !== undefined){
    //         eventEmbed.addFields([
    //             {name: "Mentor scribble:", value: `||${mentorNote}||`, inline: true},
    //             {name: "Written by:", value: noteAuthor, inline: true}
    //         ])  
    //     }
    // }
    const files = attachment ? [attachment] : [];
    return [ eventEmbed, buttons, buttonPrefix, files ];
}

module.exports = { getEvent }