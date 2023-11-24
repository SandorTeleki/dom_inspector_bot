const { EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, MERC_URL, BASE_URL } = require('./utils');
const { mentorWhitelist, channelWhiteList } = require('./whitelist');
const { mercAliases } =require('./mercAliases');
const { similarMatches } =require('./similarMatches');
const sqlite3 = require('sqlite3').verbose();

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
    if  (/^\d+$/.test(mercName)){
        const { body, statusCode } = await request(BASE_URL + MERC_URL + '/' + encodeURIComponent(mercName));
        if (statusCode === 404){
            const errorEmbed = new EmbedBuilder()
            .setTitle("Nothing found. Better luck next time!")
            .setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            return errorEmbed;
        }
        merc  = await body.json(); 
    }

    else {
        const { body } = await request(BASE_URL + MERC_URL + FUZZY_MATCH_URL + encodeURIComponent(mercName));
        var { mercs } = await body.json();
        merc = mercs[0];
        similarMatchesString = similarMatches(mercs);
    }; 
    //console.log(merc);

    // Initialize sql
    let sql;
    // Connects to DB
    const db = new sqlite3.Database("./logs.db", sqlite3.OPEN_READWRITE);

    sql = `SELECT note FROM mentor_notes WHERE class = ? AND class_id = ? AND guild_id = ?`;
    const row = await new Promise((resolve, reject) => {
        db.get(sql, ["merc", merc.id, serverId], (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });

    // Destructuring the note property from the row object
    const { note: mentorNote } = row || {};

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
            mercEmbed.setDescription(`Mentor Note: ${mentorNote}`);
        }
    }


    // const mercEmbed = new EmbedBuilder()
    //     //.setTitle(merc.name)
    //     // .setDescription('Mentor notes will go here.')
    //     .setImage(BASE_URL + merc.screenshot)
    //     if ( similarMatchesString ) {mercEmbed.setFooter({text: similarMatches(mercs)})};
    const mercLeaderEmbed = new EmbedBuilder()
        .setImage(BASE_URL+'/units/'+ merc.commander_id+'/screenshot')
        .setDescription('Name of mercenary group leader: '+ merc.bossname)
    const mercTroopEmbed = new EmbedBuilder()
        .setImage(BASE_URL+'/units/'+ merc.unit_id+'/screenshot')
        .setDescription('Number of units: '+ merc.nrunits)
    return [mercEmbed, mercLeaderEmbed, mercTroopEmbed];
}

module.exports = { getMerc }