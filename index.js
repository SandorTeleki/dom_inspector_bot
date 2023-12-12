const fs = require('node:fs');
const path = require('node:path');
require('discord-reply'); //Before discord.client
const { Client, Collection, Intents, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const Discord = require('discord.js');
const { EmbedBuilder } = require('discord.js');
//const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js'); //Uncomment if you need to use buttons in index.js

const { getItem } = require('./utils/itemHelper');
const { getSpell } = require('./utils/spellHelper');
const { getMerc } = require('./utils/mercHelper');
const { getSite } = require('./utils/siteHelper');
const { getUnit } = require('./utils/unitHelper');
const { getHelpEmbed } = require('./utils/helpEmbed');
const { WRONG_BOT_URL, ALL_BOOLI_URL } = require('./utils/utils');
const { mentorWhitelist, channelWhiteList } = require('./utils/whitelist');
const { checkId } = require('./utils/checkId');
const { sqlInsertLog, sqlBuildTables, sqlDropTables } = require('./utils/sqlHelper');

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
	] 
}); 

// Slash Commands
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

//Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


//Set Bot activity
client.on("ready", () => {
	client.user.setActivity(' your questions', { type: 'LISTENING' });
});

//Bot Login
client.login(token);



//#####################################################################################################

//Prefix commands list (might need some refactoring)
//Prefix symbol "?" be changed to other symbol if needed -> will need to update help command if so
const prefix = "?"; 

client.on("messageCreate", async (message) => {
	// console.log(`message: ${message}, ${message.id}, ${message.content}`);
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	// Item command
  	if (message.content.startsWith(`${prefix}item`)) {
		let itemName = message.content.slice(6).toLowerCase();
		var itemCommandData = message;
		const itemEmbed = await getItem( itemName, itemCommandData );
		createLog(message);
		createLogEmbed(message);

		await message.channel.send({ embeds: [itemEmbed] });
	};
	// Spell command
	if (message.content.startsWith(`${prefix}spell`)) {
		let spellName = message.content.slice(7).toLowerCase();
		var spellCommandData = message;
		const spellEmbed = await getSpell( spellName, spellCommandData );
		createLog(message);
		createLogEmbed(message);

        await message.channel.send({ embeds: [spellEmbed] });
	};
	// Merc command
	if (message.content.startsWith(`${prefix}merc`)) {
		let mercName = message.content.slice(6).toLowerCase();
		var mercCommandData = message;
		try {
			let [mercEmbed, mercLeaderEmbed, mercTroopEmbed] = await getMerc(mercName, mercCommandData); 
			createLog(message);
			createLogEmbed(message);

			await message.channel.send({ embeds: [mercEmbed, mercLeaderEmbed, mercTroopEmbed] });
		}
		catch {
			const errorEmbed = new EmbedBuilder()
            	.setTitle("Nothing found. Better luck next time!")
            	.setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            await message.channel.send({ embeds: [errorEmbed]});
		}
	};
	// Site command
	if (message.content.startsWith(`${prefix}site`)) {
		const siteName = message.content.slice(6).toLowerCase();
		var siteCommandData = message;
		const siteEmbed = await getSite( siteName, siteCommandData );
		createLog(message);
		createLogEmbed(message);

		await message.channel.send({ embeds: [siteEmbed] });
	};
	// Unit command
	if (message.content.startsWith(`${prefix}unit`)) {
		let unitName = message.content.slice(6).toLowerCase();
		var unitCommandData = message;
		const unitEmbed = await getUnit( unitName, unitCommandData );
		createLog(message);
		createLogEmbed(message);

        await message.channel.send({ embeds: [unitEmbed] });
	};
	// Help command
	if (message.content.startsWith(`${prefix}help`)) {
		createLog(message);
		createLogEmbed(message);

		await message.channel.send({ embeds: [getHelpEmbed()] });
	}	
	// Undone command
	if (message.content.startsWith(`${prefix}undone`)){
		const undoneEmbed = new EmbedBuilder()
            	.setTitle("Who, me?!")
            	.setImage(WRONG_BOT_URL);
		createLog(message);
		createLogEmbed(message);

        await message.channel.send({ embeds: [undoneEmbed]});
	}
	// Timer command
	if (message.content.startsWith(`${prefix}timer`)){
		const timerEmbed = new EmbedBuilder()
            	.setTitle("Who, me?!")
            	.setImage(WRONG_BOT_URL);
		createLog(message);
		createLogEmbed(message);

        await message.channel.send({ embeds: [timerEmbed]});
	}
	// Booli command
	if (message.content.startsWith(`${prefix}booli`)){
		var randomBooli = ALL_BOOLI_URL[Math.floor(Math.random() * ALL_BOOLI_URL.length)];
		const booliEmbed = new EmbedBuilder()
            	.setTitle("Do your turn!")
            	.setImage(randomBooli);
		createLog(message);
		createLogEmbed(message);

        await message.channel.send({ embeds: [booliEmbed]});
	}

	// Note command
	if (message.content.startsWith(`${prefix}note`)){
		// Parts of the message we need to use later
		const server = message.guild.name;
		const serverId = message.guildId;
		const channelName = message.channel.name;
		const channelId = message.channelId;
		const user = message.author.tag;
		const userId = message.author.id;
		const text = message.content;
		const unixTimestamp = message.createdTimestamp;

		// Note length related constants
		const noteLengthLimitMin = 3;
		const noteLengthLimitMax = 250;

		//Check user permission to use the ?note command 
		if (mentorWhitelist.every((item)=>{ return item !== userId })){
			message.reply('You are not whitelisted to use the `?note` command.');
			return;
		};
		//Check channel permission to have the note command used in it
		if (channelWhiteList.every((item)=>{ return item !== channelId })){
			message.reply('This channel is not whitelisted to use the `?note` command.');
			return;
		};
		if (message.content === "?note"){
			message.reply("The syntax is: `?note {class} {id} {text}`\n`{class}` is the name of the command (item, merc, unit etc.) \n`{id}` is the id of the item, merc, unit etc. \n`{text}` is the text of your mentor note (cannot be blank). \n Note: the current note min-length is "+`\`${noteLengthLimitMin}\``+" characters and the max-length is "+`\`${noteLengthLimitMax}\``+" characters.");
			return;
		}
		//Split the note into matching groups using regex to make error checking and logging easier
		const regEx = /^(item|spell|unit|site|merc)\s(\d+)\s(.*)/i;
		const note = message.content.slice(6);
		const noteMatch = note.match(regEx);
		// Error handling if note syntax is incorrect
		if (noteMatch === null) {
			message.reply("Syntax error. Please refer to `?note` for syntax information.");
			return;
		} 

		// Error handling if note is too long
		const noteText = noteMatch[3];
		if (noteText.length > noteLengthLimitMax) {
			message.reply(`Max note length is \`${noteLengthLimitMax}\` characters, yours is \`${noteText.length - noteLengthLimitMax}\` too long.`)
			return;
		}
		// Error handling if note is too short
		if (noteText.length < noteLengthLimitMin) {
			message.reply(`Min note length is \`${noteLengthLimitMin}\` characters, yours is \`${noteLengthLimitMin - noteText.length}\` too short.`)
			return;
		}

		// Creating constants to hold data from result of note.match(regEx) - noteMatch[0] will return everything
		const commandUsed = noteMatch[1].toLowerCase();
		const idUsed = noteMatch[2];
		const noteWritten = noteMatch[3];

		//Checking if ID exists
		checkId( message, noteWritten, commandUsed, idUsed, serverId, server, channelName, channelId, user, userId, text, unixTimestamp); 
	}
});

// Logs slash command interaction - (also sends an embed with all the information to a prespecified Discord channel)
client.on(Events.InteractionCreate, async function logInteraction(data) {
	if (!data) return;
	if (!data.isChatInputCommand()) return;
	else {
		logEmbedBuilder(data);
	}
})

// Embed creation for prefix commands
async function createLogEmbed(data) {
    if (!data) return;
    else {
		logEmbedBuilder(data);
    }
}

// Logging for prefix commands
function createLog(message){
	//Read more: https://old.discordjs.dev/#/docs/discord.js/main/search?query=message
	// and: https://old.discordjs.dev/#/docs/discord.js/main/class/Message
	const server = message.guild.name;
	const serverId = message.guildId;
	const channelName = message.channel.name;
	const channelId = message.channelId;
	const user = message.author.tag;
	const userId = message.author.id;
	const text = message.content;
	const unixTimestamp = message.createdTimestamp;

	sqlInsertLog(server,serverId,channelName,channelId,user,userId,text,unixTimestamp);
}

//Messages and interactions use different synthax. Message (type = 0) and interaction (type = 2)
async function logEmbedBuilder (data) {
	const channel = client.channels.cache.get('1165999070272303174');
	const serverName = (data.type === 0 ? data.guild : data.guild.name );
	const serverId = (data.type === 0 ? data.guildId : data.guild.id );
	const channelName = (data.type === 0 ? data.channel : data.channel.name );
	const channelId = (data.type === 0 ? data.channelId : data.channel.id );
	const userName = (data.type === 0 ? data.author.tag : data.user.tag );
	const userId = (data.type === 0 ? data.author.id : data.user.id );
	const command = (data.type === 0 ? data.content : data.toString() );
	const createdAt = data.createdAt;
	const timestamp = data.createdTimestamp;

	const logEmbed = new EmbedBuilder()
		.setTitle('Chat command used')
		.addFields({ name: 'Server Name', value: `${serverName}`})
		.addFields({ name: 'Server ID', value: `${serverId}`})
		.addFields({ name: 'Channel Name', value: `${channelName}`})
		.addFields({ name: 'Channel ID', value: `${channelId}`})
		.addFields({ name: 'User Name', value: `${userName}`})
		.addFields({ name: 'User ID', value: `${userId}`})
		.addFields({ name: 'Chat command', value: `${command}`})
		.addFields({ name: 'Created At', value: `${createdAt}`})
		.addFields({ name: 'Unix Timestamp', value: `${timestamp}`})
		// .setTimestamp();
	await channel.send({embeds: [logEmbed] });
}

//SQL build/drop tables
sqlBuildTables();
// If needed, uncomment sqlDropTables to drop all tables (or go into helper function for granular control over table drop)
//sqlDropTables();