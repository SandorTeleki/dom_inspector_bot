const { BASE_URL } = require('./utils');
const { checkNoteMatch } = require('./checkNoteMatch'); 
const { request } = require('undici');

async function checkId(commandResult, message, noteWritten, commandUsed, idUsed, serverId, server, channelName, channelId, user, userId, text, unixTimestamp) {
    const { statusCode, body } = await request(BASE_URL + '/' + commandUsed + 's/' + idUsed);
    //Error handling in case server responds with a '404' - mostly because not all IDs exist
    if (statusCode === 404){
        message.reply(`For the "${commandUsed}" command nothing was found matching ID: ${idUsed}. Please double check the ID and try again...`);
        return;
    }
    commandResult = await body.json();
    //Runs if we don't hit a 404 above
    commandName = commandResult.name;
    checkNoteMatch(message, noteWritten, commandUsed, idUsed, serverId, server, channelName, channelId, user, userId, text, unixTimestamp);
}

module.exports = { checkId }