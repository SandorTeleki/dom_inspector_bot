const sqlite3 = require('sqlite3').verbose();

// Initialize sql
let sql;
// Connects to DB
const db = new sqlite3.Database("./logs.db", sqlite3.OPEN_READWRITE);


function updateNote(message, noteWritten, commandUsed, idUsed, serverId, server, channelName, channelId, user, userId, text, unixTimestamp) {
    sql = `UPDATE mentor_notes SET note = ? WHERE class = ? AND class_id = ? AND guild_id = ?`
    db.run(sql,[noteWritten,commandUsed,idUsed,serverId],(err)=> {
        if(err) return console.error(err.message);
    });

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
    
    console.log("Note was found, updating note...")
    message.reply("Note was updated!")
}

module.exports = { updateNote }