const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { ITEM_URL, BASE_URL } = require('../utils/utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('item')
		.setDescription('Replies with information about an item')
        .addStringOption(option => option.setName('item_name').setDescription('Enter the name of the item')),

	async execute(interaction) {
        
        
        async function getJSONResponse(body) {
            let fullBody = '';
            for await (const data of body) {
                fullBody += data.toString();
                console.log(`Console log 1: `+fullBody);
            }
            return JSON.parse(fullBody);
        }
        const itemName = interaction.options.getString('item_name');
		
		const itemSearchResult = await request(ITEM_URL + encodeURIComponent(itemName));
        console.log(`Console log 2: `+ITEM_URL + encodeURIComponent(itemName)); 
        console.log(`Console log 3: `+itemSearchResult.body);
        console.log(`Console log 4: `+itemSearchResult.body.toString())
		const { list } = await getJSONResponse(itemSearchResult.body);
        console.log(`Console log 5: `+list)

		if (!list.length) {
			await interaction.reply(`No results found for **${itemName}**.`);
		}

		const [answer] = list;
        
		const itemEmbed = new MessageEmbed()
            .setColor('#000000')
            .setTitle(answer.name)
            .setURL('X')
            .setAuthor({ name: 'Author' })
            .setDescription('Lot of hassle, but hey, it was working!')
            .setImage(BASE_URL + answer.screenshot)
            .setTimestamp()
            .setFooter({ text: 'A small step for X, a giant leap for X' });
        await interaction.reply({ embeds: [itemEmbed] });
	},
};