const { EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, MERC_URL, BASE_URL } = require('./utils');
const { mentorWhitelist, channelWhiteList } = require('./whitelist');
const { mercAliases } =require('./mercAliases');
const { similarMatches } =require('./similarMatches');
const { sqlGetMentorNote } = require('./sqlHelper');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js'); //for buttons

async function getMerc( mercName, mercCommandData ){
    //Messages and interactions use different synthax. Using ternary operator to check if we got info from a message (type = 0) or interaction (type = 2)
    const channelId = (mercCommandData.type === 0 ? mercCommandData.channelId : mercCommandData.channel.id );
    const serverId = (mercCommandData.type === 0 ? mercCommandData.guildId : mercCommandData.guild.id );
    
    //----Other useful parts of the message/interaction----//
    // const server = mercCommandData.guild.name;
    // const serverId = mercCommandData.guildId;
    // const channelName = mercCommandData.channel.name;
    // const channelId = mercCommandData.channelId;
    // const user = mercCommandData.author.tag;
    // const userId = mercCommandData.author.id;
    // const text = mercCommandData.content;
    // const unixTimestamp = mercCommandData.createdTimestamp;

    if (mercName in mercAliases){ mercName = mercAliases[mercName] };
    var merc;
    var similarMatchesString;
    const regExId = /^(\d+)/;

    if  (mercName.match(regExId)){
        const mercIdMatch = mercName.match(regExId);
        const mercId = mercIdMatch[1];
        const { body, statusCode } = await request(BASE_URL + MERC_URL + '/' + encodeURIComponent(mercId));
        if (statusCode === 404){
            const errorEmbed = new EmbedBuilder()
            .setTitle("Nothing found. Better luck next time!")
            .setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            return errorEmbed;
        }
        merc  = await body.json(); 
    } else {
        const { body } = await request(BASE_URL + MERC_URL + FUZZY_MATCH_URL + encodeURIComponent(mercName));
        var { mercs } = await body.json();
        merc = mercs[0];
        similarMatchesString = similarMatches(mercs);
    }; 
    //console.log(merc);

    var type = "merc";
    var typeId = merc.id;

    const row = await sqlGetMentorNote(type, typeId, serverId);

    // Destructuring the note property from the row object
    const { note: mentorNote, written_by_user: noteAuthor } = row || {};

    console.log("mentorNote: " + mentorNote);

    // Construct the mercEmbed after obtaining the mentorNote value
    const mercEmbed = new EmbedBuilder()
        .setImage(BASE_URL + merc.screenshot);
    if (similarMatchesString) {
        mercEmbed.setFooter({ text: similarMatchesString });
    }

    // For prod version, swap channelId for guildId, so mentor notes for one guild are only visible for that guild
    if (channelWhiteList.some((item)=>{ return item === channelId })) {
        mercEmbed.setTitle(`ID: ${merc.id}`);
        if(mentorNote !== undefined){
            mercEmbed.addFields([
                {name: "Mentor scribble:", value: `||${mentorNote}||`, inline: true},
                {name: "Written by:", value: noteAuthor, inline: true}
            ])
        }
    }
    //Buttons
    const mercLeaderButton = new ButtonBuilder()
        .setLabel(`Merc leader: ${merc.bossname}`)
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('merc-leader');

    const mercUnitButton = new ButtonBuilder()
        .setLabel(`Merc units (ID#): ${merc.unit_id}`)
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('merc-unit');

    //Embeds
    const mercLeaderEmbed = new EmbedBuilder()
        .setImage(BASE_URL+'/units/'+ merc.commander_id+'/screenshot')
        .setDescription('Name of mercenary group leader: '+ merc.bossname);
    const mercTroopEmbed = new EmbedBuilder()
        .setImage(BASE_URL+'/units/'+ merc.unit_id+'/screenshot')
        .setDescription('Number of units: '+ merc.nrunits);
    return [mercEmbed, mercLeaderEmbed, mercTroopEmbed, mercLeaderButton, mercUnitButton];
}

module.exports = { getMerc }