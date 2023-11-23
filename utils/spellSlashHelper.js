const { EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, SPELL_URL, BASE_URL } = require('./utils');
const { spellAliases } =require('./spellAliases');
const { similarMatches } =require('./similarMatches');
const sqlite3 = require('sqlite3').verbose();

async function getSpell( spellName, spellInteraction ){
    //Grabbing useful parts of the message
    const serverName = spellInteraction.guild.name;
    const serverId = spellInteraction.guild.id;
    const channelName = spellInteraction.channel.name;
    const channelId = spellInteraction.channel.id;
    const userName = spellInteraction.user.tag; 
    const userId = spellInteraction.user.id; 
    const command = spellInteraction.toString();
    const createdAt = spellInteraction.createdAt;
    const timestamp = spellInteraction.createdTimestamp;

    if (spellName in spellAliases){ spellName = spellAliases[spellName] };
    var spell;
    var similarMatchesString;
    if  (/^\d+$/.test(spellName)){
        const { body, statusCode } = await request(BASE_URL + SPELL_URL + '/' + encodeURIComponent(spellName));
        if (statusCode === 404){
            const errorEmbed = new EmbedBuilder()
            .setTitle("Nothing found. Better luck next time!")
            .setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            return errorEmbed;
        }
        spell  = await body.json();
    }

    else {
        const { body } = await request(BASE_URL + SPELL_URL + FUZZY_MATCH_URL + encodeURIComponent(spellName));
        var { spells } = await body.json();
        spell = spells[0];
        similarMatchesString = similarMatches(spells);
    }; 

    // Initialize sql
    let sql;
    // Connects to DB
    const db = new sqlite3.Database("./logs.db", sqlite3.OPEN_READWRITE);

    sql = `SELECT note FROM mentor_notes WHERE class = ? AND class_id = ? AND guild_id = ?`;
    const row = await new Promise((resolve, reject) => {
        db.get(sql, ["spell", spell.id, serverId], (err, row) => {
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

    // Construct the spellEmbed after obtaining the mentorNote value
    const spellEmbed = new EmbedBuilder()
        .setImage(BASE_URL + spell.screenshot);

    if (similarMatchesString) {
        spellEmbed.setFooter({ text: similarMatchesString });
    }
    const channelWhiteList = [996378750474256385, 1175513268320735322, 1176173846118805554,1007203153252454401];
    // For prod version, swap channelId for guildId, so mentor notes for one guild are only visible for that guild
    if (channelWhiteList.every((item)=>{ return item !== channelId })) {
        spellEmbed.setTitle(`ID: ${spell.id}`);
        if(mentorNote !== undefined){
            spellEmbed.setDescription(`Mentor Note: ${mentorNote}`);
        }
    }
    return spellEmbed;
}

module.exports = { getSpell }