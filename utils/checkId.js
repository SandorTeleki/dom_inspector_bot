const { request } = require('undici');
const sqlite3 = require('sqlite3').verbose();
const { BASE_URL } = require('./utils');
const { sqlSelectNote, sqlInsertNote, sqlInsertLog, sqlInsertMentorLog, sqlUpdateNote } = require('./sqlHelper');

// Initialize sql
let sql;
// Connects to DB
const db = new sqlite3.Database("./logs.db", sqlite3.OPEN_READWRITE);

var commandResult;

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
        sql = `SELECT class, class_id FROM mentor_notes WHERE class = ? AND class_id = ? AND guild_id = ?`
        db.get(sql,[commandUsed,idUsed,serverId],(err, row) => {
            if(err) return console.error(err.message);
        console.log(JSON.stringify(row));
            
            // If no match was found, we INSERT the new note
            if (row === undefined){ 			
                sqlInsertNote(commandUsed,idUsed,commandName,noteWritten,server,serverId,unixTimestamp,user);
                sqlInsertLog(server,serverId,channelName,channelId,user,userId,text,unixTimestamp);
                sqlInsertMentorLog(commandUsed,idUsed,commandName,noteWritten,server,serverId,unixTimestamp,user);
                console.log('Nothing found, inserting new note...');
                message.reply("Note was added!");
                // Gotta return so we don't UPDATE the just INSERT-ed note right away
                return;
            }
    
            //Since a match was found, we UPDATE the note
            function updateNote(message, noteWritten, commandUsed, idUsed, serverId, server, channelName, channelId, user, userId, text, unixTimestamp) {
                sqlUpdateNote(noteWritten,commandUsed,idUsed,serverId);
                sqlInsertLog(server,serverId,channelName,channelId,user,userId,text,unixTimestamp);
                sqlInsertMentorLog(commandUsed,idUsed,commandName,noteWritten,server,serverId,unixTimestamp,user);
                console.log("Note was found, updating note...");
                message.reply("Note was updated!");
            }
            updateNote(message, noteWritten, commandUsed, idUsed, serverId, server, channelName, channelId, user, userId, text, unixTimestamp);
        });
    }
    checkNoteMatch(message, noteWritten, commandUsed, idUsed, serverId, server, channelName, channelId, user, userId, text, unixTimestamp);
}

module.exports = { checkId }