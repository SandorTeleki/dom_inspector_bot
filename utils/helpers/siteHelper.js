const { EmbedBuilder } = require('discord.js');

const { FUZZY_MATCH_URL, SITE_URL, BASE_URL } = require('../utils');
// const { mentorWhitelist, channelWhiteList } = require('../whitelist');
const { siteAliases } = require('../aliases/siteAliases');
const { similarMatchesStringify, similarMatchesArray } =require('../similarMatches');
// const { sqlGetMentorNote } = require('../sqlHelper');
const { buttonCreator } = require('../buttonCreator');
const { fetchScreenshot } = require('../fetchScreenshot');
const { fetchApiJson, getEntityList, getFirstEntity } = require('../apiRequest');
const { notFoundResult, apiErrorResult } = require('../notFoundResult');

async function getSite( siteName, siteCommandData ){
    //Messages and interactions use different syntax. Using ternary operator to check if we got info from a message (type = 0) or interaction (type = 2)
    // const channelId = (siteCommandData.type === 0 ? siteCommandData.channelId : siteCommandData.channel.id );
    // const serverId = (siteCommandData.type === 0 ? siteCommandData.guildId : siteCommandData.guild.id );
    
    //----Other useful parts of the message/interaction----//
    // const server = siteCommandData.guild.name;
    // const serverId = siteCommandData.guildId;
    // const channelName = siteCommandData.channel.name;
    // const channelId = siteCommandData.channelId;
    // const user = siteCommandData.author.tag;
    // const userId = siteCommandData.author.id;
    // const text = siteCommandData.content;
    // const unixTimestamp = siteCommandData.createdTimestamp;
    
    let site;
    let similarMatchesString;
    let similarMatchesList;
    const regExId = /^(\d+)/;

    if (siteName in siteAliases){ 
        siteName = siteAliases[siteName];
    };

    if  (siteName.match(regExId)){
        const siteIdMatch = siteName.match(regExId);
        const siteId = siteIdMatch[1];
        const result = await fetchApiJson(BASE_URL + SITE_URL + '/' + encodeURIComponent(siteId));
        if (result.notFound) {
            return notFoundResult();
        }
        if (!result.ok) {
            return apiErrorResult();
        }
        site = getFirstEntity(result.data, 'sites');
        if (!site) {
            return notFoundResult();
        }
    } else {
        const result = await fetchApiJson(BASE_URL + SITE_URL + FUZZY_MATCH_URL + encodeURIComponent(siteName));
        if (result.notFound) {
            return notFoundResult();
        }
        if (!result.ok) {
            return apiErrorResult();
        }
        const sites = getEntityList(result.data, 'sites');
        if (!sites.length) {
            return notFoundResult();
        }
        site = sites[0];
        similarMatchesString = similarMatchesStringify(sites);
        similarMatchesList = similarMatchesArray(sites);
    }; 

    // Building buttons from similarMatchesList
    let buttons = [];
    const buttonPrefix = "site-";
    if (similarMatchesList) {
        buttons = buttonCreator(similarMatchesList, buttonPrefix);
    }

    // Fetch the screenshot as a file attachment so Discord can display it in the embed
    const screenshotFilename = `site_${site.id}.png`;
    const attachment = await fetchScreenshot(site.image, screenshotFilename);

    // Construct the siteEmbed after obtaining the mentorNote value
    const siteEmbed = new EmbedBuilder()
        .setImage(attachment ? `attachment://${screenshotFilename}` : null);

    if (similarMatchesString && similarMatchesString.length < 2048) {
        siteEmbed.setFooter({ text: `Other matches [ID#]:\n${similarMatchesString}` });
    } else if (similarMatchesString && similarMatchesString.length >= 2048) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("Too many matches to display. Try narrowing your search!")
        return [errorEmbed, [], "", []];
    }

    // let type = "site";
    // let typeId = site.id;
    //
    // const row = await sqlGetMentorNote(type, typeId, serverId);
    //
    // // Destructuring the note property from the row object
    // const { note: mentorNote, written_by_user: noteAuthor } = row || {};
    // //console.log("mentorNote: " + mentorNote);
    //
    // // For prod version, swap channelId for guildId, so mentor notes for one guild are only visible for that guild
    // if (channelWhiteList.some((item)=>{ return item === channelId })) {
    //     siteEmbed.setTitle(`ID: ${site.id}`);
    //     if(mentorNote !== undefined){
    //         siteEmbed.addFields([
    //             {name: "Mentor scribble:", value: `||${mentorNote}||`, inline: true},
    //             {name: "Written by:", value: noteAuthor, inline: true}
    //         ])  
    //     }
    // }
    const files = attachment ? [attachment] : [];
    return [ siteEmbed, buttons, buttonPrefix, files ];
}

module.exports = { getSite }