const fs = require('node:fs');
const path = require('node:path');
require('discord-reply'); //Before discord.client
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js'); 
const { request } = require('undici');
const { BASE_URL, ITEM_URL, SPELL_URL, COMMANDER_URL, MERC_URL, SITE_URL, UNIT_URL } = require('./utils/utils');


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
	client.user.setActivity(' slash commands', { type: 'LISTENING' });
});

//Bot Login
client.login(token);



//########################################################################

//Testing prefix commands
const prefix = "?";
client.on("messageCreate", async (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

  	if (message.content.startsWith(`${prefix}item`)) {
			const itemName = message.content.slice(6);
			const { body } = await request(ITEM_URL + encodeURIComponent(itemName));
			const { items } = await body.json();
			
			if (!items.length)
				await message.reply(`No results found for **${itemName}**.`);
	
			const [itemAnswer] = items;
			const itemEmbed = new MessageEmbed()
				.setTitle(itemAnswer.name)
				.setDescription('Mentor notes will go here.')
				.setImage(BASE_URL + itemAnswer.screenshot)
			await message.reply({ embeds: [itemEmbed] });
	};

	if (message.content.startsWith(`${prefix}spell`)) {
		const spellName = message.content.slice(7);
		const { body } = await request(SPELL_URL + encodeURIComponent(spellName));
        const { spells } = await body.json();
        
        if (!spells.length)
            await message.reply(`No results found for **${spellName}**.`);

        const [answerSpell] = spells;
		const spellEmbed = new MessageEmbed()
            .setTitle(answerSpell.name)
            .setDescription('Mentor notes will go here.')
            .setImage(BASE_URL + answerSpell.screenshot)
        await message.reply({ embeds: [spellEmbed] });
	};

	if (message.content.startsWith(`${prefix}commander`)) {
		const commanderName = message.content.slice(11);
			const { body } = await request(COMMANDER_URL + encodeURIComponent(commanderName));
			const { commanders } = await body.json();
			
			if (!commanders.length)
				await message.reply(`No results found for **${commanderName}**.`);

			const [commanderAnswer] = commanders;
			const commanderEmbed = new MessageEmbed()
				.setTitle(commanderAnswer.name)
				.setDescription('Mentor notes will go here.')
				.setImage(BASE_URL + commanderAnswer.screenshot)
			await message.reply({ embeds: [commanderEmbed] });
	};

	if (message.content.startsWith(`${prefix}merc`)) {
		const mercName = message.content.slice(6);
        const { body } = await request(MERC_URL + encodeURIComponent(mercName));
        const { mercs } = await body.json();
        
        if (!mercs.length)
            await message.reply(`No results found for **${mercName}**.`);

        const [mercAnswer] = mercs;
		const mercEmbed = new MessageEmbed()
            .setTitle(mercAnswer.name)
            .setDescription('Mentor notes will go here.')
            .setImage(BASE_URL + mercAnswer.screenshot)
        const mercLeaderEmbed = new MessageEmbed()
            .setImage(BASE_URL+'/commanders/'+mercAnswer.commander_id+'/screenshot')
            .setDescription('Name of mercenary group leader: '+mercAnswer.bossname)
        const mercTroopEmbed = new MessageEmbed()
            .setImage(BASE_URL+'/commanders/'+mercAnswer.unit_id+'/screenshot')
            .setDescription('Number of units: '+mercAnswer.nrunits)
        await message.reply({ embeds: [mercEmbed, mercLeaderEmbed, mercTroopEmbed] });
	};

	if (message.content.startsWith(`${prefix}site`)) {
		const siteName = message.content.slice(6);
		const { body } = await request(SITE_URL + encodeURIComponent(siteName));
		const { sites } = await body.json();
		
		if (!sites.length)
			await message.reply(`No results found for **${siteName}**.`);

		const [siteAnswer] = sites;
		const siteEmbed = new MessageEmbed()
			.setTitle(siteAnswer.name)
			.setDescription('Mentor notes will go here.')
			.setImage(BASE_URL + siteAnswer.screenshot)
		await message.reply({ embeds: [siteEmbed] });
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
                { name : '```/event {event_name}```', value: 'work in progress'},
                { name : 'Source/background', value: "Based on Larzm42's Dominions 5 Inspector: [Dom5Inspector](https://larzm42.github.io/dom5inspector/)"},
            )
            .setFooter({ text: "A bot by Timotej and Toldi.\nOriginally created for the Immersion server!" });
        await message.reply({ embeds: [testEmbed] });
		}		
});

// !item command
// client.on('messageCreate', async message => {
// 	if (message.content.startsWith('!item')) {
// 	  message.reply('Hey'); //Line (Inline) Reply with mention
// 	  message.reply(`My name is ${client.user.username}`); //Line (Inline) Reply without mention
// 	}
// });