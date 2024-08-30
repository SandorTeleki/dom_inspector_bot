const sqlite3 = require('sqlite3').verbose();

// Initialize sql
let sql;
// Connects to DB
const db = new sqlite3.Database("./logs.db", sqlite3.OPEN_READWRITE);

function sqlSelectNote(commandUsed, idUsed, serverId){
    sql = `SELECT class, class_id FROM mentor_notes WHERE class = ? AND class_id = ? AND guild_id = ?`
    db.get(sql,[commandUsed,idUsed,serverId],(err, row) => {
        if (err) {
            console.error(err.message);
            reject(err);
        } else {
            resolve(row);
        }
})};

const sqlGetMentorNote = (type, typeId, serverId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT note, written_by_user FROM mentor_notes WHERE class = ? AND class_id = ? AND guild_id = ?`;
        db.get(sql, [type, typeId, serverId], (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

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

function sqlUpdateNote(noteWritten,user,commandUsed,idUsed,serverId){
    sql = `UPDATE mentor_notes SET note = ?, written_by_user = ? WHERE class = ? AND class_id = ? AND guild_id = ?`
    db.run(sql,[noteWritten,user,commandUsed,idUsed,serverId],(err)=> {
        if(err) return console.error(err.message);
    });
}

function sqlBuildTables(){
    // Create table to store usage logs
    sql = `CREATE TABLE IF NOT EXISTS logs (
        server_name TEXT,
        server_id INTEGER,
        channel_name TEXT,
        channel_id INTEGER,
        user_name TEXT,
        user_id INTEGER,
        chat_command BLOB,
        unix_timestamp INTEGER)`;
    db.run(sql);

    // Create table to store mentor notes
    sql = `CREATE TABLE IF NOT EXISTS mentor_notes (
        class TEXT,
        class_id INTEGER,
        name TEXT,
        note TEXT,
        guild_name TEXT,
        guild_id INTEGER,
        written_time INTEGER,
        written_by_user TEXT)`;
    db.run(sql);

    // Create table to store mentor note logs
    sql = `CREATE TABLE IF NOT EXISTS mentor_logs (
        class TEXT,
        class_id INTEGER,
        name TEXT,
        note TEXT,
        guild_name TEXT,
        guild_id INTEGER,
        written_time INTEGER,
        written_by_user TEXT)`;
    db.run(sql);
}

function sqlDropTables(){
    db.run("DROP TABLE logs");
    db.run("DROP TABLE mentor_notes");
    db.run("DROP TABLE mentor_logs");
}

module.exports = { sqlSelectNote, sqlGetMentorNote, sqlInsertNote, sqlInsertLog, sqlInsertMentorLog, sqlUpdateNote, sqlBuildTables, sqlDropTables }