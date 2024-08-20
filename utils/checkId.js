const { request } = require('undici');
const sqlite3 = require('sqlite3').verbose();
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { BASE_URL } = require('./utils');
const { sqlSelectNote, sqlGetMentorNote, sqlInsertNote, sqlInsertLog, sqlInsertMentorLog, sqlUpdateNote } = require('./sqlHelper');

// Initialize sql
let sql;
// Connects to DB
const db = new sqlite3.Database("./logs.db", sqlite3.OPEN_READWRITE);

let commandResult;

async function checkId(message, noteWritten, commandUsed, idUsed, serverId, server, channelName, channelId, user, userId, text, unixTimestamp) {
    const { statusCode, body } = await request(BASE_URL + '/' + commandUsed + 's/' + idUsed);
    //Error handling in case server responds with a '404' - mostly because not all IDs exist
    if (statusCode === 404){
        message.reply(`For the "${commandUsed}" command nothing was found matching ID: ${idUsed}. Please double check the ID and try again...`);
        return;
    }
    commandResult = await body.json();
    //Runs if we don't hit a 404 above
    commandName = commandResult.name;

    function checkNoteMatch(message, noteWritten, commandUsed, idUsed, serverId, server, channelName, channelId, user, userId, text, unixTimestamp) {
        //Need to refactor to pull sql stuff out into helper file. Will need to return row and possible turn it into an async function/promise
        sql = `SELECT class, class_id FROM mentor_notes WHERE class = ? AND class_id = ? AND guild_id = ?`
        db.get(sql,[commandUsed,idUsed,serverId],(err, row) => {
            if(err) return console.error(err.message);
        //console.log(JSON.stringify(row));
            
            // If no match was found, we INSERT the new note
            if (row === undefined){ 			
                sqlInsertNote(commandUsed,idUsed,commandName,noteWritten,server,serverId,unixTimestamp,user);
                sqlInsertLog(server,serverId,channelName,channelId,user,userId,text,unixTimestamp);
                sqlInsertMentorLog(commandUsed,idUsed,commandName,noteWritten,server,serverId,unixTimestamp,user);
                //console.log('Nothing found, inserting new note...');
                message.reply("Note was added!");
                // Gotta return so we don't UPDATE the just INSERT-ed note right away
                return;
            }
    
            //Since a match was found, we UPDATE the note
            function updateNote(message, noteWritten, commandUsed, idUsed, serverId, server, channelName, channelId, user, userId, text, unixTimestamp) {
                sqlUpdateNote(noteWritten,user,commandUsed,idUsed,serverId);
                sqlInsertLog(server,serverId,channelName,channelId,user,userId,text,unixTimestamp);
                sqlInsertMentorLog(commandUsed,idUsed,commandName,noteWritten,server,serverId,unixTimestamp,user);
                //console.log("Note was found, updating note...");
                //message.reply("Note was updated!");
            }

            // Check if user wants to overwrite (UPDATE) existing note before commiting the update
            async function handleNoteOverwrite (message){	
                const yesButton = new ButtonBuilder()
                    .setLabel('Yes')
                    .setStyle(ButtonStyle.Success)
                    .setCustomId('yes-button')
                
                const noButton = new ButtonBuilder()
                    .setLabel('No')
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId('no-button')
                const buttonRow = new ActionRowBuilder().addComponents(yesButton, noButton);

                // If there is a note, we grab the existing note and author to show it when you plan to overwrite the note
                const existingNote = await sqlGetMentorNote(commandUsed, idUsed, serverId);
                const { note: mentorNote, written_by_user: noteAuthor } = existingNote || {};
            
                const reply = await message.reply({
                    content: `A mentor note already exists, are you sure you want to overwrite it? \nExisting note: \`${mentorNote}\`. Written by: \`${noteAuthor}\` \nYour note: \`${noteWritten}\``, 
                    components: [buttonRow]});
            
                const filter = (i) => i.user.id === message.author.id;
            
                const collector = reply.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    filter,
                    time: 10_000,
                    max: 1
                });
            
                collector.on('collect', (interaction) => {
                    if (interaction.customId === 'yes-button'){
                        updateNote(message, noteWritten, commandUsed, idUsed, serverId, server, channelName, channelId, user, userId, text, unixTimestamp);
                        interaction.reply({content: 'You overwrote the existing mentor note'});
                        return;
                    }
            
                    if (interaction.customId === 'no-button'){
                        interaction.reply({content: 'You discarded your changes'});
                        return;
                    }
                });
            
                collector.on('end', () => {
                    yesButton.setDisabled(true);
                    noButton.setDisabled(true);
            
                    reply.edit({
                        components: [buttonRow]
                    })
                })
            
            }
            handleNoteOverwrite(message);
        });
    }
    checkNoteMatch(message, noteWritten, commandUsed, idUsed, serverId, server, channelName, channelId, user, userId, text, unixTimestamp);
}

module.exports = { checkId }