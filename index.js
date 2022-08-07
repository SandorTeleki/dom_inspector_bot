const fs = require('node:fs');
const path = require('node:path');
require('discord-reply'); //Before discord.client
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js'); 
const { getItem } = require('./utils/itemHelper');
const { getSpell } = require('./utils/spellHelper');
const { getCommander } = require('./utils/commanderHelper');
const { getMerc } = require('./utils/mercHelper');
const { getSite } = require('./utils/siteHelper');
const { getUnit } = require('./utils/unitHelper');
const { getHelpEmbed } = require('./utils/helpEmbed');



const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

//Commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}


client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


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


//Ready message in console
// client.once('ready', () => {
// 	console.log('Ready!');
// });

//Set Bot activity
client.on("ready", () => {
	client.user.setActivity(' your questions', { type: 'LISTENING' });
});

//Bot Login
client.login(token);



//########################################################################

//Testing prefix commands
const prefix = "?";
client.on("messageCreate", async (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

  	if (message.content.startsWith(`${prefix}item`)) {
		let itemName = message.content.slice(6).toLowerCase();
		const itemEmbed = await getItem( itemName );
		await message.channel.send({ embeds: [itemEmbed] });
	};

	if (message.content.startsWith(`${prefix}spell`)) {
		let spellName = message.content.slice(7).toLowerCase();
		const spellEmbed = await getSpell( spellName );
        await message.channel.send({ embeds: [spellEmbed] });
	};

	if (message.content.startsWith(`${prefix}commander`)) {
		let commanderName = message.content.slice(11).toLowerCase();
		const commanderEmbed = await getCommander( commanderName );
		await message.channel.send({ embeds: [commanderEmbed] });
	};

	if (message.content.startsWith(`${prefix}merc`)) {
		let mercName = message.content.slice(6).toLowerCase();
		let [mercEmbed, mercLeaderEmbed, mercTroopEmbed] = await getMerc(mercName);
		await message.channel.send({ embeds: [mercEmbed, mercLeaderEmbed, mercTroopEmbed] });
	};

	if (message.content.startsWith(`${prefix}site`)) {
		const siteName = message.content.slice(6).toLowerCase();
		const siteEmbed = await getSite( siteName );
		await message.channel.send({ embeds: [siteEmbed] });
	};

	if (message.content.startsWith(`${prefix}unit`)) {
		let unitName = message.content.slice(6).toLowerCase();
		const unitEmbed = await getUnit( unitName );
        await message.channel.send({ embeds: [unitEmbed] });
	};

	if (message.content.startsWith(`${prefix}help`)) {
		await message.channel.send({ embeds: [getHelpEmbed()] });
	}		
});
