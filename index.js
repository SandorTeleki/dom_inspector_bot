const fs = require('node:fs');
const path = require('node:path');
require('discord-reply'); //Before discord.client
const { ActivityType, Client, Collection, Intents, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js'); //for buttons

const { getItem } = require('./utils/itemHelper');
const { getSpell } = require('./utils/spellHelper');
const { getMerc } = require('./utils/mercHelper');
const { getSite } = require('./utils/siteHelper');
const { getUnit } = require('./utils/unitHelper');
const { getHelpEmbed } = require('./utils/helpEmbed');
const {
	prefix,
	noteLengthLimitMin,
	noteLengthLimitMax,
	WRONG_BOT_URL,
	ALL_BOOLI_URL,
} = require('./utils/utils');
const { mentorWhitelist, channelWhiteList } = require('./utils/whitelist');
const { checkId } = require('./utils/checkId');
const { sqlBuildTables, sqlDropTables } = require('./utils/sqlHelper');
const { createLog } = require('./utils/logHelper');
const { buttonWrapper } = require('./utils/buttonWrapper'); 
const { getRandomNumber } = require('./utils/randomNumber');

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
	client.user.setPresence({
        status: 'online',
        activities: [
            {
                name: 'your questions',
                type: ActivityType.Listening,
                state: 'your questions'
            }
        ]
    });
});

//Bot Login
client.login(token);

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:;', error);
});

//#####################################################################################################

client.on("messageCreate", async (message) => {
	if (!message.content.startsWith(prefix) ) return;
	if (message.author.bot && message.author.id !== client.user.id) return;

	// Item command
  	if (message.content.startsWith(`${prefix}item`)) {
		let itemName = message.content.slice(6).toLowerCase();
		let itemCommandData = message;
		const [itemEmbed, buttons, buttonPrefix ] = await getItem( itemName, itemCommandData );

		//Logging
		createLog(message);
		createLogEmbed(message);

		const listID = buttons.map(button => button.data.custom_id);
		const buttonsArray = buttonWrapper(buttons);

        const response = await message.channel.send({ embeds: [itemEmbed], components: buttonsArray });

		const collector =  response.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 30_000, //removed max as buttons get disabled as is
		});

		collector.on('collect', async (interaction) => {
			if (interaction.user.id === message.author.id){
				const interactionCustomID = interaction.customId;

				const isInListID = listID.some(id => id === interactionCustomID)
				if (isInListID){
					const justTheID = interaction.customId.replace(buttonPrefix, "")
					const [ itemEmbed ] = await getItem( justTheID, interaction ); 
					createLog(interaction);
					createLogEmbed(interaction);
					await interaction.reply({embeds: [itemEmbed]});

					let arrayOfActionRows = interaction.message.components;
					const buttons = [];
					for (const actionRow of arrayOfActionRows){
						const ComponentsRow = actionRow.components;
						for (let a = 0; a < ComponentsRow.length; a++){
							const current = ComponentsRow[a];
							if(interactionCustomID === current.data.custom_id || current.data.disabled){
								const buttonBuilder = new ButtonBuilder()
									.setCustomId(`${current.data.custom_id}`)
									.setLabel(`${current.data.label}`)
									.setStyle(ButtonStyle.Secondary)
									.setDisabled(true);
								buttons.push(buttonBuilder);
							} else {
								const buttonBuilder = new ButtonBuilder()
									.setCustomId(`${current.data.custom_id}`)
									.setLabel(`${current.data.label}`)
									.setStyle(ButtonStyle.Secondary)
									.setDisabled(false);
								buttons.push(buttonBuilder)
							};
						}
					}
					const buttonsArray = buttonWrapper(buttons);

					response.edit({
						components: buttonsArray
					})
				}
			} else {
				interaction.reply({ content: `These buttons aren't for you!`, ephemeral: true });
			}
		});

		collector.on('end', (interaction) => {
			const arrayOfActionRows = buttonsArray;
			const buttons = [];
			for (const actionRow of arrayOfActionRows){
			  const componentsRow = actionRow.components;
			  for (let a = 0; a < componentsRow.length; a++){
				const current = componentsRow[a];
				buttons.push(
				  new ButtonBuilder()
						.setCustomId(`${current.data.custom_id}`)
						.setLabel(`${current.data.label}`)
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(true)
				);
			}
			const buttonsArray = buttonWrapper(buttons);

			response.edit({
				components: buttonsArray
			})
			}
		})

	};

	// Spell command
	if (message.content.startsWith(`${prefix}spell`)) {
		let spellName = message.content.slice(7).toLowerCase();
		let spellCommandData = message;
		const [spellEmbed, buttons, buttonPrefix ] = await getSpell( spellName, spellCommandData );

		//Logging
		createLog(message);
		createLogEmbed(message);

		const listID = buttons.map(button => button.data.custom_id);
		const buttonsArray = buttonWrapper(buttons);

        const response = await message.channel.send({ embeds: [spellEmbed], components: buttonsArray });

		const collector =  response.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 30_000, //removed max as buttons get disabled as is
		});

		collector.on('collect', async (interaction) => {
			if (interaction.user.id === message.author.id){
				const interactionCustomID = interaction.customId;

				const isInListID = listID.some(id => id === interactionCustomID)
				if (isInListID){
					const justTheID = interaction.customId.replace(buttonPrefix, "")
					const [ spellEmbed ] = await getSpell( justTheID, interaction ); 
					createLog(interaction);
					createLogEmbed(interaction);
					await interaction.reply({embeds: [spellEmbed]});

					let arrayOfActionRows = interaction.message.components;
					const buttons = [];
					for (const actionRow of arrayOfActionRows){
						const ComponentsRow = actionRow.components;
						for (let a = 0; a < ComponentsRow.length; a++){
							const current = ComponentsRow[a];
							if(interactionCustomID === current.data.custom_id || current.data.disabled){
								const buttonBuilder = new ButtonBuilder()
									.setCustomId(`${current.data.custom_id}`)
									.setLabel(`${current.data.label}`)
									.setStyle(ButtonStyle.Secondary)
									.setDisabled(true);
								buttons.push(buttonBuilder);
							} else {
								const buttonBuilder = new ButtonBuilder()
									.setCustomId(`${current.data.custom_id}`)
									.setLabel(`${current.data.label}`)
									.setStyle(ButtonStyle.Secondary)
									.setDisabled(false);
								buttons.push(buttonBuilder)
							};
						}
					}
					const buttonsArray = buttonWrapper(buttons);

					response.edit({
						components: buttonsArray
					})
				}
			} else {
				interaction.reply({ content: `These buttons aren't for you!`, ephemeral: true });
			}
		});

		collector.on('end', (interaction) => {
			const arrayOfActionRows = buttonsArray;
			const buttons = [];
			for (const actionRow of arrayOfActionRows){
			  const componentsRow = actionRow.components;
			  for (let a = 0; a < componentsRow.length; a++){
				const current = componentsRow[a];
				buttons.push(
				  new ButtonBuilder()
						.setCustomId(`${current.data.custom_id}`)
						.setLabel(`${current.data.label}`)
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(true)
				);
			}
			const buttonsArray = buttonWrapper(buttons);

			response.edit({
				components: buttonsArray
			})
			}
		})

	};

	// Merc command
	if (message.content.startsWith(`${prefix}merc`)) {
		let mercName = message.content.slice(6).toLowerCase();
		let mercCommandData = message;
		try {
			let [mercEmbed, mercLeaderEmbed, mercTroopEmbed, mercLeaderButton, mercUnitButton] = await getMerc(mercName, mercCommandData);
			//Can try adding similarMatches - concat the buttonRow with buttonsArray and pass it as one? 
			const buttonRow = new ActionRowBuilder().addComponents(mercLeaderButton, mercUnitButton);
			createLog(message);
			createLogEmbed(message);
			const response = await message.channel.send({ embeds: [mercEmbed], components: [buttonRow] });
	
			const collector = response.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 20_000 // removed 'max' to avoid issues if non-author tries clicking the button
				});
	
			collector.on('collect', (interaction) => {
				if (interaction.user.id === message.author.id){
					if (interaction.customId === 'merc-leader'){
						mercLeaderButton.setDisabled(true);
						response.edit({
							components: [buttonRow]
						})
						interaction.reply({ embeds: [mercLeaderEmbed]});
					}

					if (interaction.customId === 'merc-unit'){
						mercUnitButton.setDisabled(true);
						response.edit({
							components: [buttonRow]
						})
						interaction.reply({ embeds: [mercTroopEmbed]});
					}
				} else {
					interaction.reply({ content: `These buttons aren't for you!`, ephemeral: true });
				}
			});

			collector.on('end', () => {
				mercLeaderButton.setDisabled(true);
				mercUnitButton.setDisabled(true);
	
				response.edit({
					components: [buttonRow]
				})
			})
		} catch {
			const errorEmbed = new EmbedBuilder()
            	.setTitle("Nothing found. Better luck next time!")
            	.setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            await message.channel.send({ embeds: [errorEmbed]});
		}
	};

	// Site command
	if (message.content.startsWith(`${prefix}site`)) {
		const siteName = message.content.slice(6).toLowerCase();
		let siteCommandData = message;
		const [siteEmbed, buttons, buttonPrefix ] = await getSite( siteName, siteCommandData );
		
		//Logging
		createLog(message);
		createLogEmbed(message);
		const listID = buttons.map(button => button.data.custom_id);
		const buttonsArray = buttonWrapper(buttons);

        const response = await message.channel.send({ embeds: [siteEmbed], components: buttonsArray });

		const collector =  response.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 30_000, //removed max as buttons get disabled as is
		});

		collector.on('collect', async (interaction) => {
			if (interaction.user.id === message.author.id){
				const interactionCustomID = interaction.customId;

				const isInListID = listID.some(id => id === interactionCustomID)
				if (isInListID){
					const justTheID = interaction.customId.replace(buttonPrefix, "")
					const [ siteEmbed ] = await getSite( justTheID, interaction ); 
					createLog(interaction);
					createLogEmbed(interaction);
					await interaction.reply({embeds: [siteEmbed]});

					let arrayOfActionRows = interaction.message.components;
					const buttons = [];
					for (const actionRow of arrayOfActionRows){
						const ComponentsRow = actionRow.components;
						for (let a = 0; a < ComponentsRow.length; a++){
							const current = ComponentsRow[a];
							if(interactionCustomID === current.data.custom_id || current.data.disabled){
								const buttonBuilder = new ButtonBuilder()
									.setCustomId(`${current.data.custom_id}`)
									.setLabel(`${current.data.label}`)
									.setStyle(ButtonStyle.Secondary)
									.setDisabled(true);
								buttons.push(buttonBuilder);
							} else {
								const buttonBuilder = new ButtonBuilder()
									.setCustomId(`${current.data.custom_id}`)
									.setLabel(`${current.data.label}`)
									.setStyle(ButtonStyle.Secondary)
									.setDisabled(false);
								buttons.push(buttonBuilder)
							};
						}
					}
					const buttonsArray = buttonWrapper(buttons);

					response.edit({
						components: buttonsArray
					})
				}
			} else {
				interaction.reply({ content: `These buttons aren't for you!`, ephemeral: true });
			}
		});

		collector.on('end', (interaction) => {
			const arrayOfActionRows = buttonsArray;
			const buttons = [];
			for (const actionRow of arrayOfActionRows){
			  const componentsRow = actionRow.components;
			  for (let a = 0; a < componentsRow.length; a++){
				const current = componentsRow[a];
				buttons.push(
				  new ButtonBuilder()
						.setCustomId(`${current.data.custom_id}`)
						.setLabel(`${current.data.label}`)
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(true)
				);
			}
			const buttonsArray = buttonWrapper(buttons);

			response.edit({
				components: buttonsArray
			})
			}
		})
	};

	// Unit command
	if (message.content.startsWith(`${prefix}unit`)) {
		let unitName = message.content.slice(6).toLowerCase();
		let unitCommandData = message;
		const [unitEmbed, buttons, buttonPrefix ] = await getUnit( unitName, unitCommandData );
		
		//Logging
		createLog(message);
		createLogEmbed(message);

		const listID = buttons.map(button => button.data.custom_id);
		const buttonsArray = buttonWrapper(buttons);

        const response = await message.channel.send({ embeds: [unitEmbed], components: buttonsArray });

		const collector =  response.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 30_000, //removed max as buttons get disabled as is
		});

		collector.on('collect', async (interaction) => {
			if (interaction.user.id === message.author.id){
				const interactionCustomID = interaction.customId;

				const isInListID = listID.some(id => id === interactionCustomID)
				if (isInListID){
					const justTheID = interaction.customId.replace(buttonPrefix, "")
					const [ unitEmbed ] = await getUnit( justTheID, interaction ); 
					createLog(interaction);
					createLogEmbed(interaction);
					await interaction.reply({embeds: [unitEmbed]});

					let arrayOfActionRows = interaction.message.components;
					const buttons = [];
					for (const actionRow of arrayOfActionRows){
						const ComponentsRow = actionRow.components;
						for (let a = 0; a < ComponentsRow.length; a++){
							const current = ComponentsRow[a];
							if(interactionCustomID === current.data.custom_id || current.data.disabled){
								const buttonBuilder = new ButtonBuilder()
									.setCustomId(`${current.data.custom_id}`)
									.setLabel(`${current.data.label}`)
									.setStyle(ButtonStyle.Secondary)
									.setDisabled(true);
								buttons.push(buttonBuilder);
							} else {
								const buttonBuilder = new ButtonBuilder()
									.setCustomId(`${current.data.custom_id}`)
									.setLabel(`${current.data.label}`)
									.setStyle(ButtonStyle.Secondary)
									.setDisabled(false);
								buttons.push(buttonBuilder)
							};
						}
					}
					const buttonsArray = buttonWrapper(buttons);

					response.edit({
						components: buttonsArray
					})
				}
			} else {
				interaction.reply({ content: `These buttons aren't for you!`, ephemeral: true });
			}
		});

		collector.on('end', (interaction) => {
			const arrayOfActionRows = buttonsArray;
			const buttons = [];
			for (const actionRow of arrayOfActionRows){
			  const componentsRow = actionRow.components;
			  for (let a = 0; a < componentsRow.length; a++){
				const current = componentsRow[a];
				buttons.push(
				  new ButtonBuilder()
						.setCustomId(`${current.data.custom_id}`)
						.setLabel(`${current.data.label}`)
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(true)
				);
			}
			const buttonsArray = buttonWrapper(buttons);

			response.edit({
				components: buttonsArray
			})
			}
		})
		
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
		let randomBooli = ALL_BOOLI_URL[Math.floor(Math.random() * ALL_BOOLI_URL.length)];
		const booliEmbed = new EmbedBuilder()
            	.setTitle("Do your turn!")
            	.setImage(randomBooli);
		createLog(message);
		createLogEmbed(message);

        await message.channel.send({ embeds: [booliEmbed]});
	}

	// Random number command
	if (message.content.startsWith(`${prefix}random`)){
		let randomNumber = message.content.slice(8);
		const response = getRandomNumber(randomNumber);
		if(isNaN(response)) {
			message.channel.send(response);
		} else {
			message.channel.send(`Your random number is: \`${response}\` out of \`${randomNumber}\`.`)
		}
		createLog(message);
		createLogEmbed(message);
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
		//Explanation for note syntax and rules
		if (message.content === "?note"){
			message.reply("The syntax is: `?note {class} {id} {text}`\n`{class}` is the name of the command (item, merc, unit etc.) \n`{id}` is the id of the item, merc, unit etc. \n`{text}` is the text of your mentor note (cannot be blank). \n Note: the current note min-length is "+`\`${noteLengthLimitMin}\``+" characters and the max-length is "+`\`${noteLengthLimitMax}\``+" characters.");
			return;
		}
		
		//Split the note into matching groups using regex to make error checking and logging easier
		const regEx = /^(item|spell|unit|site|merc)\s(\d+)\s(.*)/i; // change it to either (\d[1-4]:(0-4)) OR make a separate matching group for slot
		const note = message.content.slice(6);
		const noteMatch = note.match(regEx);
		// Error handling if note syntax is incorrect
		if (noteMatch === null) {
			message.reply("Syntax error. Please refer to `?note` for syntax information.");
			return;
		} 
		
		// Creating constants to hold data from result of note.match(regEx) - noteMatch[0] will return everything
		const commandUsed = noteMatch[1].toLowerCase();
		const idUsed = noteMatch[2];
		const noteWritten = noteMatch[3];

		// Error handling if note is too long
		if (noteWritten.length > noteLengthLimitMax) {
			message.reply(`Max note length is \`${noteLengthLimitMax}\` characters, yours is \`${noteWritten.length - noteLengthLimitMax}\` too long.`)
			return;
		}
		// Error handling if note is too short
		if (noteWritten.length < noteLengthLimitMin) {
			message.reply(`Min note length is \`${noteLengthLimitMin}\` characters, yours is \`${noteLengthLimitMin - noteWritten.length}\` too short.`)
			return;
		}

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

//Messages and interactions use different synthax. Message (type = 0) and interaction (type = 2), button interaction (type = 3)
async function logEmbedBuilder (data) {
	let command
	const channel = client.channels.cache.get('1165999070272303174');
	const serverName = (data.type === 0 ? data.guild : data.guild.name );
	const serverId = (data.type === 0 ? data.guildId : data.guild.id );
	const channelName = (data.type === 0 ? data.channel : data.channel.name );
	const channelId = (data.type === 0 ? data.channelId : data.channel.id );
	const userName = (data.type === 0 ? data.author.tag : data.user.tag );
	const userId = (data.type === 0 ? data.author.id : data.user.id );
	if (data.type === 0){  command = data.content } else if (data.type === 2){  command = data.toString()} else { command = data.customId};
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
//If needed, uncomment sqlDropTables to drop all tables (or go into helper function [sqlHelper.js] for granular control over table drop)

sqlBuildTables();
//sqlDropTables();