const fs = require('node:fs');
const path = require('node:path');
require('discord-reply'); //Before discord.client
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js'); //Put into embededTest.js


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

//Commands

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
});


// !item command
client.on('messageCreate', async message => {
	if (message.content.startsWith('!item')) {
	  message.reply('Hey'); //Line (Inline) Reply with mention
	  message.reply(`My name is ${client.user.username}`); //Line (Inline) Reply without mention
	}
});



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

//Set Bot activity
client.on("ready", () => {
	client.user.setActivity(' /items', { type: 'LISTENING' });
});

client.login(token);