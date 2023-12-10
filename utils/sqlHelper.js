const sqlite3 = require('sqlite3').verbose();

// Initialize sql
let sql;
// Connects to DB
const db = new sqlite3.Database("./logs.db", sqlite3.OPEN_READWRITE);

function sqlSelectNote(commandUsed, idUsed, serverId){
    sql = `SELECT class, class_id FROM mentor_notes WHERE class = ? AND class_id = ? AND guild_id = ?`
    db.get(sql,[commandUsed,idUsed,serverId],(err, row) => {
        if(err) return console.error(err.message);
    console.log(JSON.stringify(row));
})};

function sqlInsertNote(commandUsed,idUsed,commandName,noteWritten,server,serverId,unixTimestamp,user){
    sql = `INSERT INTO mentor_notes(class,class_id,name,note,guild_name,guild_id,written_time,written_by_user) VALUES (?,?,?,?,?,?,?,?)`
    db.run(sql,[commandUsed,idUsed,commandName,noteWritten,server,serverId,unixTimestamp,user],(err) => {
        if(err) return console.error(err.message);
    });
}

function sqlInsertLog(server,serverId,channelName,channelId,user,userId,text,unixTimestamp){
    sql = `INSERT INTO logs(server_name,server_id,channel_name,channel_id,user_name,user_id,chat_command,unix_timestamp) VALUES (?,?,?,?,?,?,?,?)`
    db.run(sql,[server,serverId,channelName,channelId,user,userId,text,unixTimestamp],(err) => {
        if(err) return console.error(err.message);
    });
}

function sqlInsertMentorLog(commandUsed,idUsed,commandName,noteWritten,server,serverId,unixTimestamp,user){
    sql = `INSERT INTO mentor_logs(class,class_id,name,note,guild_name,guild_id,written_time,written_by_user) VALUES (?,?,?,?,?,?,?,?)`
    db.run(sql,[commandUsed,idUsed,commandName,noteWritten,server,serverId,unixTimestamp,user],(err) => {
        if(err) return console.error(err.message);
    });
}

function sqlUpdateNote(noteWritten,commandUsed,idUsed,serverId){
    sql = `UPDATE mentor_notes SET note = ? WHERE class = ? AND class_id = ? AND guild_id = ?`
    db.run(sql,[noteWritten,commandUsed,idUsed,serverId],(err)=> {
        if(err) return console.error(err.message);
    });
}

module.exports = { sqlSelectNote, sqlInsertNote, sqlInsertLog, sqlInsertMentorLog, sqlUpdateNote }