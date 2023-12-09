const sqlite3 = require('sqlite3').verbose();
const { updateNote } = require('./updateNote');

// Initialize sql
let sql;
// Connects to DB
const db = new sqlite3.Database("./logs.db", sqlite3.OPEN_READWRITE);

function checkNoteMatch(message, noteWritten, commandUsed, idUsed, serverId, server, channelName, channelId, user, userId, text, unixTimestamp) {
    sql = `SELECT class, class_id FROM mentor_notes WHERE class = ? AND class_id = ? AND guild_id = ?`
    db.get(sql,[commandUsed,idUsed,serverId],(err, row) => {
        if(err) return console.error(err.message);
    console.log(JSON.stringify(row));
        
        // If no match was found, we INSERT the new note
        if (row === undefined){ 			
            sql = `INSERT INTO mentor_notes(class,class_id,name,note,guild_name,guild_id,written_time,written_by_user) VALUES (?,?,?,?,?,?,?,?)`
            db.run(sql,[commandUsed,idUsed,commandName,noteWritten,server,serverId,unixTimestamp,user],(err) => {
                if(err) return console.error(err.message);
            });
            console.log('Nothing found, inserting new note...');
            message.reply("Note was added!")

            //Adding command log usage
            sql = `INSERT INTO logs(server_name,server_id,channel_name,channel_id,user_name,user_id,chat_command,unix_timestamp) VALUES (?,?,?,?,?,?,?,?)`
            db.run(sql,[server,serverId,channelName,channelId,user,userId,text,unixTimestamp],(err) => {
                if(err) return console.error(err.message);
            });

            //Adding mentor note log
            sql = `INSERT INTO mentor_logs(class,class_id,name,note,guild_name,guild_id,written_time,written_by_user) VALUES (?,?,?,?,?,?,?,?)`
            db.run(sql,[commandUsed,idUsed,commandName,noteWritten,server,serverId,unixTimestamp,user],(err) => {
                if(err) return console.error(err.message);
            });

            // Gotta return so we don't UPDATE the just INSERT-ed note right away
            return;
        }

        //Since a match was found, we UPDATE the note
        updateNote(message, noteWritten, commandUsed, idUsed, serverId, server, channelName, channelId, user, userId, text, unixTimestamp);
    });
}

module.exports = { checkNoteMatch }