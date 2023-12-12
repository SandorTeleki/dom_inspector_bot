const { EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { FUZZY_MATCH_URL, SPELL_URL, BASE_URL } = require('./utils');
const { mentorWhitelist, channelWhiteList } = require('./whitelist');
const { spellAliases } =require('./spellAliases');
const { similarMatches } =require('./similarMatches');
const sqlite3 = require('sqlite3').verbose();

async function getSpell( spellName, spellCommandData ){
    //Messages and interactions use different synthax. Using ternary operator to check if we got info from a message (type = 0) or interaction (type = 2)
    const channelId = (spellCommandData.type === 0 ? spellCommandData.channelId : spellCommandData.channel.id );
    const serverId = (spellCommandData.type === 0 ? spellCommandData.guildId : spellCommandData.guild.id );
    
    //----Other useful parts of the message/interaction----//
    // const server = spellCommandData.guild.name;
    // const serverId = spellCommandData.guildId;
    // const channelName = spellCommandData.channel.name;
    // const channelId = spellCommandData.channelId;
    // const user = spellCommandData.author.tag;
    // const userId = spellCommandData.author.id;
    // const text = spellCommandData.content;
    // const unixTimestamp = spellCommandData.createdTimestamp;

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
    // For prod version, swap channelId for guildId, so mentor notes for one guild are only visible for that guild
    if (channelWhiteList.some((item)=>{ return item === channelId })) {
        spellEmbed.setTitle(`ID: ${spell.id}`);
        if(mentorNote !== undefined){
            spellEmbed.setDescription(`Mentor scribbles: ||${mentorNote}||`);
        }
    }
    return spellEmbed;
}

module.exports = { getSpell }