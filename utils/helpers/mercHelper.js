const { EmbedBuilder } = require('discord.js');
const { ButtonBuilder, ButtonStyle } = require('discord.js');

const { FUZZY_MATCH_URL, MERC_URL, BASE_URL } = require('../utils');
// const { mentorWhitelist, channelWhiteList } = require('../whitelist');
const { mercAliases } =require('../aliases/mercAliases');
const { similarMatchesStringify } =require('../similarMatches');
// const { sqlGetMentorNote } = require('../sqlHelper');
const { fetchScreenshot } = require('../fetchScreenshot');
const { fetchApiJson, getEntityList, getFirstEntity } = require('../apiRequest');
const { notFoundEmbed, apiErrorEmbed } = require('../notFoundResult');

function mercNotFoundResult() {
	const embed = notFoundEmbed();
	return [embed, null, null, null, null, [], [], []];
}

function mercApiErrorResult() {
	const embed = apiErrorEmbed();
	return [embed, null, null, null, null, [], [], []];
}

async function getMerc( mercName, mercCommandData ){
    //Messages and interactions use different syntax. Using ternary operator to check if we got info from a message (type = 0) or interaction (type = 2)
    // const channelId = (mercCommandData.type === 0 ? mercCommandData.channelId : mercCommandData.channel.id );
    // const serverId = (mercCommandData.type === 0 ? mercCommandData.guildId : mercCommandData.guild.id );
    
    //----Other useful parts of the message/interaction----//
    // const server = mercCommandData.guild.name;
    // const serverId = mercCommandData.guildId;
    // const channelName = mercCommandData.channel.name;
    // const channelId = mercCommandData.channelId;
    // const user = mercCommandData.author.tag;
    // const userId = mercCommandData.author.id;
    // const text = mercCommandData.content;
    // const unixTimestamp = mercCommandData.createdTimestamp;

    let merc;
    let similarMatchesString;
    const regExId = /^(\d+)/;

    if (mercName in mercAliases){
        mercName = mercAliases[mercName];
    };

    if  (mercName.match(regExId)){
        const mercIdMatch = mercName.match(regExId);
        const mercId = mercIdMatch[1];
        const result = await fetchApiJson(BASE_URL + MERC_URL + '/' + encodeURIComponent(mercId));
        if (result.notFound) {
            return mercNotFoundResult();
        }
        if (!result.ok) {
            return mercApiErrorResult();
        }
        merc = getFirstEntity(result.data, 'mercs');
        if (!merc) {
            return mercNotFoundResult();
        }
    } else {
        const result = await fetchApiJson(BASE_URL + MERC_URL + FUZZY_MATCH_URL + encodeURIComponent(mercName));
        if (result.notFound) {
            return mercNotFoundResult();
        }
        if (!result.ok) {
            return mercApiErrorResult();
        }
        const mercs = getEntityList(result.data, 'mercs');
        if (!mercs.length) {
            return mercNotFoundResult();
        }
        merc = mercs[0];
        similarMatchesString = similarMatchesStringify(mercs);
    }; 
    //console.log(merc);

    // let type = "merc";
    // let typeId = merc.id;
    //
    // const row = await sqlGetMentorNote(type, typeId, serverId);
    //
    // // Destructuring the note property from the row object
    // const { note: mentorNote, written_by_user: noteAuthor } = row || {};
    //
    // //console.log("mentorNote: " + mentorNote);
    //
    // // Construct the mercEmbed after obtaining the mentorNote value
    const mercFilename = `merc_${merc.id}.png`;
    const mercAttachment = await fetchScreenshot(merc.image, mercFilename);

    const mercEmbed = new EmbedBuilder()
        .setImage(mercAttachment ? `attachment://${mercFilename}` : null);

    if (similarMatchesString && similarMatchesString.length < 2048) {
        mercEmbed.setFooter({ text: `Other matches [ID#]:\n${similarMatchesString}` });
    } else if (similarMatchesString && similarMatchesString.length >= 2048) {
        const errorEmbed = new EmbedBuilder()
            .setTitle("Too many matches to display. Try narrowing your search!")
        return [errorEmbed, null, null, null, null, [], [], []];
    }

    // For prod version, swap channelId for guildId, so mentor notes for one guild are only visible for that guild
    // if (channelWhiteList.some((item)=>{ return item === channelId })) {
    //     if(mentorNote !== undefined){
    //         mercEmbed.addFields([
    //             {name: "Mentor scribble:", value: `||${mentorNote}||`, inline: true},
    //             {name: "Written by:", value: noteAuthor, inline: true},
    //             {name: "ID:", value: `${merc.id}`, inline: true},
    //         ])
    //     } else {
    //         mercEmbed.setTitle(`ID: ${merc.id}`)
    //     }
    // }
    //Buttons
    const mercLeaderButton = new ButtonBuilder()
        .setLabel(`Merc leader: ${merc.bossname} (ID: ${merc.com})`)
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('merc-leader');

    const mercUnitButton = new ButtonBuilder()
        .setLabel(`Merc units (ID: ${merc.unit})`)
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('merc-unit');

    //Embeds
    const leaderFilename = `merc_leader_${merc.com}.png`;
    const leaderAttachment = await fetchScreenshot(`/units/${merc.com}/screenshot`, leaderFilename);

    const troopFilename = `merc_troop_${merc.unit}.png`;
    const troopAttachment = await fetchScreenshot(`/units/${merc.unit}/screenshot`, troopFilename);

    const mercLeaderEmbed = new EmbedBuilder()
        .setImage(leaderAttachment ? `attachment://${leaderFilename}` : null)
        .addFields(
            {name: 'Name of mercenary group leader:', value: `${merc.bossname}`, inline: true},
            {name: 'ID:', value: `${merc.com}`, inline: true},
        );
    const mercTroopEmbed = new EmbedBuilder()
        .setImage(troopAttachment ? `attachment://${troopFilename}` : null)
        .addFields(
            {name:'Number of units:', value: `${merc.nrunits}`, inline: true},
            {name: 'ID:', value: `${merc.unit}`, inline: true},
        );

    const mercFiles = mercAttachment ? [mercAttachment] : [];
    const leaderFiles = leaderAttachment ? [leaderAttachment] : [];
    const troopFiles = troopAttachment ? [troopAttachment] : [];
    return [mercEmbed, mercLeaderEmbed, mercTroopEmbed, mercLeaderButton, mercUnitButton, mercFiles, leaderFiles, troopFiles];
}

module.exports = { getMerc }