const { sqlInsertLog } = require('./sqlHelper');

// Creates log for SQL
function createLog(data){
	//Read more: https://old.discordjs.dev/#/docs/discord.js/main/search?query=message
	// and: https://old.discordjs.dev/#/docs/discord.js/main/class/Message
	const server = data.guild.name;
	const serverId = (data.type === 0 ? data.guildId : data.guild.id );
	const channelName = data.channel.name;
	const channelId = (data.type === 0 ? data.channelId : data.channel.id );
	const user = (data.type === 0 ? data.author.tag : data.user.tag );
	const userId = (data.type === 0 ? data.author.id : data.user.id );
	if (data.type === 0){ var text = data.content } else if (data.type === 2){ var text = data.toString()} else {var text = data.customId};
	const unixTimestamp = data.createdTimestamp;

	sqlInsertLog(server,serverId,channelName,channelId,user,userId,text,unixTimestamp);
}


module.exports = { createLog }