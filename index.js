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
		let itemName = message.content.slice(6);
		const itemEmbed = await getItem( itemName );
		await message.reply({ embeds: [itemEmbed] });
	};

	if (message.content.startsWith(`${prefix}spell`)) {
		let spellName = message.content.slice(7);
		const spellEmbed = await getSpell( spellName );
        await message.reply({ embeds: [spellEmbed] });
	};

	if (message.content.startsWith(`${prefix}commander`)) {
		let commanderName = message.content.slice(11);
		const commanderEmbed = await getCommander( commanderName );
		await message.reply({ embeds: [commanderEmbed] });
	};

	if (message.content.startsWith(`${prefix}merc`)) {
		let mercName = message.content.slice(6);
		let [mercEmbed, mercLeaderEmbed, mercTroopEmbed] = await getMerc(mercName);
		await message.reply({ embeds: [mercEmbed, mercLeaderEmbed, mercTroopEmbed] });
	};

	if (message.content.startsWith(`${prefix}site`)) {
		const siteName = message.content.slice(6);
		const siteEmbed = await getSite( siteName );
		await message.reply({ embeds: [siteEmbed] });
	};

	if (message.content.startsWith(`${prefix}unit`)) {
		let unitName = message.content.slice(6);
		const unitEmbed = await getUnit( unitName );
        await message.reply({ embeds: [unitEmbed] });
	};

	if (message.content.startsWith(`${prefix}help`)) {
		const testEmbed = new MessageEmbed()
            .setTitle('Help for Dom_Inspector_Bot use')
            .setDescription('List of commands for the bot:')
            .addFields(
                { name :  "```/item {item_name} ```", value: 'Use this command to search for items. Replace {item_name} with the name of the item. Minor typos in item name are fine.'},
                { name : '```/spell {spell_name}```', value: 'Use this command to search for spells. Replace {spell_name} with the name of the spell. Minor typos in spell name are fine.'},
                { name : '```/commander {commander_name}```', value: 'Use this command to search for commanders (mages, heroes, pretenders etc.). Replace {commander_name} with the name of the commander. Minor typos in commander name are fine.'},
                { name : '```/merc {merc_name}```', value: 'Use this command to search for mercenaries. Replace {merc_name} with the name of the mercenary group (not the boss name, although we might add that later). Minor typos in merc name are fine.'},
                { name : '```/site {site_name}```', value: 'Use this command to search for sites. Replace {site_name} with the name of the site. Minor typos in site name are fine.'},
				{ name : '```/unit {unit_name}```', value: 'Use this command to search for units (sacreds, indies, summons etc.). Replace {unit_name} with the name of the unit. Minor typos in unit name are fine.'},
				{ name : '```/event {event_name}```', value: 'work in progress'},
				{ name : '```? {command_name}```', value: 'All slash commands will work if you type them normally with the "?" prefix before them. Like "?item frost brand"'},
				{ name : 'Alias support', value: 'Common aliases like gss for greatsword of sharpness have been added. If you have a suggestion for an alias. DM Toldi'},
                { name : 'Source/background', value: "Based on Larzm42's Dominions 5 Inspector: [Dom5Inspector](https://larzm42.github.io/dom5inspector/)"},
            )
            .setFooter({ text: "A bot by Timotej and Toldi.\nOriginally created for the Immersion server!" });
        await message.reply({ embeds: [testEmbed] });
		}		
});
