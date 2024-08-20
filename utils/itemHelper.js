const { EmbedBuilder } = require('discord.js');
const { ButtonBuilder, ButtonStyle } = require('discord.js');
const { request } = require('undici');

const { FUZZY_MATCH_URL, ITEM_URL, BASE_URL } = require('./utils');
const { mentorWhitelist, channelWhiteList } = require('./whitelist');
const { itemAliases } = require('./itemAliases');
const { similarMatchesStringify, similarMatchesArray } =require('./similarMatches');
const { sqlGetMentorNote } = require('./sqlHelper');
const { buttonCreator } = require('./buttonCreator');

async function getItem( itemName, itemCommandData ){
    //Messages and interactions use different synthax. Using ternary operator to check if we got info from a message (type = 0) or interaction (type = 2)
    const channelId = (itemCommandData.type === 0 ? itemCommandData.channelId : itemCommandData.channel.id );
    const serverId = (itemCommandData.type === 0 ? itemCommandData.guildId : itemCommandData.guild.id );
    
    //----Other useful parts of the message/interaction----//
    // const server = itemCommandData.guild.name;
    // const serverId = itemCommandData.guildId;
    // const channelName = itemCommandData.channel.name;
    // const channelId = itemCommandData.channelId;
    // const user = itemCommandData.author.tag;
    // const userId = itemCommandData.author.id;
    // const text = itemCommandData.content;
    // const unixTimestamp = itemCommandData.createdTimestamp;


    if (itemName in itemAliases){ itemName = itemAliases[itemName] };
    var item;
    var similarMatchesString;
    var similarMatchesList;
    const regExId = /^(\d+)/;

    if  (itemName.match(regExId)){
        const itemIdMatch = itemName.match(regExId);
        const itemId = itemIdMatch[1];
        const { statusCode, body } = await request(BASE_URL + ITEM_URL + '/' + encodeURIComponent(itemId));
        //console.log('statusCode', statusCode); //Check status code, if needed for debugging
        if (statusCode === 404){
            const errorEmbed = new EmbedBuilder()
            .setTitle("Nothing found. Better luck next time!")
            .setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            return errorEmbed;
        }
        item  = await body.json();
    } else {
        const { body } = await request(BASE_URL + ITEM_URL + FUZZY_MATCH_URL + encodeURIComponent(itemName));
        var { items } = await body.json();
        item = items[0];
        similarMatchesString = similarMatchesStringify(items);
        var similarMatchesList = similarMatchesArray(items);
    };

    // Building buttons from similarMatchesList
    let buttons = [];
    const buttonPrefix = "item-";
    if(similarMatchesList){
        buttons = buttonCreator(similarMatchesList, buttonPrefix);
    }

    var type = "item";
    var typeId = item.id;

    const row = await sqlGetMentorNote(type, typeId, serverId);

    // Destructuring the note property from the row object
    const { note: mentorNote, written_by_user: noteAuthor } = row || {};

    //console.log("mentorNote: " + mentorNote);

    // Construct the itemEmbed after obtaining the mentorNote value
    const itemEmbed = new EmbedBuilder()
        .setImage(BASE_URL + item.screenshot);

    if (similarMatchesString) {
        itemEmbed.setFooter({ text: `Other matches [ID#]:\n${similarMatchesString}` });
    }
    // For prod version, swap channelId for guildId, so mentor notes for one guild are only visible for that guild
    if (channelWhiteList.some((item)=>{ return item === channelId })) {
        itemEmbed.setTitle(`ID: ${item.id}`);
        if(mentorNote !== undefined){
            itemEmbed.addFields([
                {name: "Mentor scribble:", value: `||${mentorNote}||`, inline: true},
                {name: "Written by:", value: noteAuthor, inline: true}
            ])
        }
    }
    return [ itemEmbed, buttons, buttonPrefix ];
}

module.exports = { getItem }