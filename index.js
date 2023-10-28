const fs = require('node:fs');
const path = require('node:path');
require('discord-reply'); //Before discord.client
const { Client, Collection, Intents, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const Discord = require('discord.js');
const { EmbedBuilder } = require('discord.js');
// const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events} = require('discord.js'); --- For Buttons, waiting on v14...
const { getItem } = require('./utils/itemHelper');
const { getSpell } = require('./utils/spellHelper');
const { getMerc } = require('./utils/mercHelper');
const { getSite } = require('./utils/siteHelper');
const { getUnit } = require('./utils/unitHelper');
const { getHelpEmbed } = require('./utils/helpEmbed');
const { WRONG_BOT_URL, ALL_BOOLI_URL } = require('./utils/utils');
const { stringify } = require('node:querystring');

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
	] 
}); 

//Commands
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



//########################################################################

//Prefix commands
const prefix = "?";
client.on("messageCreate", async (message) => {
	// console.log(`message: ${message}, ${message.id}, ${message.content}`);
	if (!message.content.startsWith(prefix) || message.author.bot) return;

  	if (message.content.startsWith(`${prefix}item`)) {
		let itemName = message.content.slice(6).toLowerCase();
		const itemEmbed = await getItem( itemName );
		createLog(message);
		createLogEmbed(message);

		await message.channel.send({ embeds: [itemEmbed] });
	};

	if (message.content.startsWith(`${prefix}spell`)) {
		let spellName = message.content.slice(7).toLowerCase();
		const spellEmbed = await getSpell( spellName );
		createLog(message);
		createLogEmbed(message);

        await message.channel.send({ embeds: [spellEmbed] });
	};

	if (message.content.startsWith(`${prefix}merc`)) {
		let mercName = message.content.slice(6).toLowerCase();
		try {
			let [mercEmbed, mercLeaderEmbed, mercTroopEmbed] = await getMerc(mercName); 
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

	if (message.content.startsWith(`${prefix}site`)) {
		const siteName = message.content.slice(6).toLowerCase();
		const siteEmbed = await getSite( siteName );
		createLog(message);
		createLogEmbed(message);

		await message.channel.send({ embeds: [siteEmbed] });
	};

	if (message.content.startsWith(`${prefix}unit`)) {
		let unitName = message.content.slice(6).toLowerCase();
		const unitEmbed = await getUnit( unitName );
		createLog(message);
		createLogEmbed(message);

        await message.channel.send({ embeds: [unitEmbed] });
	};

	if (message.content.startsWith(`${prefix}help`)) {
		createLog(message);
		createLogEmbed(message);

		await message.channel.send({ embeds: [getHelpEmbed()] });
	}	
	
	if (message.content.startsWith(`${prefix}undone`)){
		const undoneEmbed = new EmbedBuilder()
            	.setTitle("Who, me?!")
            	.setImage(WRONG_BOT_URL);
		createLog(message);
		createLogEmbed(message);

        await message.channel.send({ embeds: [undoneEmbed]});
	}
	if (message.content.startsWith(`${prefix}timer`)){
		const timerEmbed = new EmbedBuilder()
            	.setTitle("Who, me?!")
            	.setImage(WRONG_BOT_URL);
		createLog(message);
		createLogEmbed(message);

        await message.channel.send({ embeds: [timerEmbed]});
	}
	if (message.content.startsWith(`${prefix}booli`)){
		var randomBooli = ALL_BOOLI_URL[Math.floor(Math.random() * ALL_BOOLI_URL.length)];
		const booliEmbed = new EmbedBuilder()
            	.setTitle("Do your turn!")
            	.setImage(randomBooli);
		createLog(message);
		createLogEmbed(message);

        await message.channel.send({ embeds: [booliEmbed]});
	}
	
	//Button Test - waiting for discord.js v14 first...
	// if (message.content.startsWith(`${prefix}button`)){
	// 	const row = new ActionRowBuilder()
	// 	.addComponents(
	// 		new ButtonBuilder()
	// 			.setCustomId('primary')
	// 			.setLabel('Click me!')
	// 			.setStyle(ButtonStyle.Primary),
	// 	);
	// 	const buttonEmbed = new EmbedBuilder()
    //         	.setTitle("Testing Button")	
    //     await message.channel.send({ embeds: [buttonEmbed], components: [row] });
	// }
});

// Log interaction - logs interaction and sends an embed with all info to a prespecified channel
client.on(Events.InteractionCreate, async function logInteraction(interaction) {
	//console.log(interaction);
	if (!interaction) return;
	if (!interaction.isChatInputCommand()) return;
	else {
		const channel = await client.channels.cache.get('1165999070272303174');
		const serverName = interaction.guild.name;
		const serverId = interaction.guild.id;
		const channelName = interaction.channel.name;
		const channelId = interaction.channel.id;
		const userName = interaction.user.tag; 
		const userId = interaction.user.id; 
		const command = interaction;
		const createdAt = interaction.createdAt;
		const timestamp = interaction.createdTimestamp;

		const embed = new EmbedBuilder()
			.setTitle('Chat command used')
			.addFields({ name: 'Server Name', value: `${serverName}`})
			.addFields({ name: 'Server ID', value: `${serverId}`})
			.addFields({ name: 'Channel Name', value: `${channelName}`})
			.addFields({ name: 'Channel ID', value: `${channelId}`})
			.addFields({ name: 'User Name', value: `${userName}`})
			.addFields({ name: 'User ID', value: `${userId}`})
			.addFields({ name: 'Chat command', value: `${command}`})
			.addFields({ name: 'Created At', value: `${createdAt}`})
			.addFields({ name: 'Timestamp', value: `${timestamp}`})
			// .setTimestamp();
		await channel.send({embeds: [embed] });
	}
})

function createLog(message){
	//Read more: https://old.discordjs.dev/#/docs/discord.js/main/search?query=message
	// and: https://old.discordjs.dev/#/docs/discord.js/main/class/Message
	const server = message.guild;
	const serverId = message.guildId;
	const channelName = message.channel;
	const channelId = message.channelId;
	const user = message.author.tag;
	const userId = message.author.id;
	const text = message.content;
	const timestamp = message.createdAt;
	// const infodump = stringify(e.client.user);

	console.log(`
	Server Name: ${server}
	Server ID: ${serverId}
	Channel Name: ${channelName}
	Channel ID: ${channelId}
	User Name: ${user}
	User Id: ${userId}
	Command Name: ${text}
	Timestamp: ${timestamp}
	`)
}

async function createLogEmbed(message) {
    //console.log(interaction);
    if (!message) return;
    else {
        const channel = await client.channels.cache.get('1165999070272303174');
        const server = message.guild;
		const serverId = message.guildId;
		const channelName = message.channel;
		const channelId = message.channelId;
        const user = message.author.tag;
		const userId = message.author.id;
		const text = message.content;
        const timestamp = message.createdAt;

        const embed = new EmbedBuilder()
            .setTitle('Chat command used')
            .addFields({ name: 'Server Name', value: `${server}`})
			.addFields({ name: 'Server ID', value: `${serverId}`})
			.addFields({ name: 'Channel Name', value: `${channelName}`})
			.addFields({ name: 'Channel ID', value: `${channelId}`})
            .addFields({ name: 'Chat command', value: `${text}`})
            .addFields({ name: 'User name', value: `${user}`})
			.addFields({ name: 'User ID', value: `${userId}`})
            .addFields({ name: 'Timestamp', value: `${timestamp}`})
            // .setTimestamp();
        await channel.send({embeds: [embed] });
    }
}

