const { EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, UNIT_URL, BASE_URL } = require('./utils');
const { mentorWhitelist, channelWhiteList } = require('./whitelist');
const { unitAliases } =require('./unitAliases');
const { similarMatches } =require('./similarMatches');
const sqlite3 = require('sqlite3').verbose();

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

    if (unitName in unitAliases){ unitName = unitAliases[unitName] };
    var unit;
    var similarMatchesString;
    var footerStrings = ' ';
    if  (/^\d+$/.test(unitName)){
        const { body, statusCode } = await request(BASE_URL + UNIT_URL + '/' + encodeURIComponent(unitName));
        if (statusCode === 404){
            const errorEmbed = new EmbedBuilder()
            .setTitle("Nothing found. Better luck next time!")
            .setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            return errorEmbed;
        }
        unit  = await body.json();
    }
    else {
        const { body } = await request(BASE_URL + UNIT_URL + FUZZY_MATCH_URL + encodeURIComponent(unitName));
        var { units } = await body.json();
        unit = units[0];
        similarMatchesString = similarMatches(units);  
    }; 

    // Initialize sql
    let sql;
    // Connects to DB
    const db = new sqlite3.Database("./logs.db", sqlite3.OPEN_READWRITE);

    sql = `SELECT note FROM mentor_notes WHERE class = ? AND class_id = ? AND guild_id = ?`;
    const row = await new Promise((resolve, reject) => {
        db.get(sql, ["unit", unit.id, serverId], (err, row) => {
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

    // Construct the unitEmbed after obtaining the mentorNote value
    const unitEmbed = new EmbedBuilder()
        .setImage(BASE_URL + unit.screenshot);

    if (unit.randompaths !== undefined){
        for ( const randompath of unit.randompaths ) {
            footerStrings += ( randompath.chance + '%' + ' of' + ' +' + randompath.levels + ' ' + randompath.paths+ ' ' +  "\n");
        }
    }

    if ( similarMatchesString ) {
        unitEmbed.setFooter({text: footerStrings + similarMatchesString})
    }
    else {
        unitEmbed.setFooter({ text: footerStrings });
    };
    //const channelWhiteList = ['996378750474256385', '1175513268320735322', '1176173846118805554', '1007203153252454401'];
    // For prod version, swap channelId for guildId, so mentor notes for one guild are only visible for that guild
    if (channelWhiteList.some((item)=>{ return item === channelId })) {
        unitEmbed.setTitle(`ID: ${unit.id}`);
        if(mentorNote !== undefined){
            unitEmbed.setDescription(`Mentor Note: ${mentorNote}`);
        }
    }  
    return unitEmbed;
}

module.exports = { getUnit }