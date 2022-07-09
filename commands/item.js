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
            }
            return JSON.parse(fullBody);
        }
        const itemName = interaction.options.getString('item_name');
		
		const itemSearchResult = await request(ITEM_URL + encodeURIComponent(itemName));
		const response = await getJSONResponse(itemSearchResult.body);

		const items = response.items;
		const firstItem = response.items[0];
        
		const itemEmbed = new MessageEmbed()
            .setColor('#000000')
            .setTitle(firstItem.name)
            .setURL('https://discord.js.org/')
            .setAuthor({ name: 'Author' })
            .setDescription('Lot of hassle, but hey, it was working!')
            .setImage(BASE_URL + firstItem.screenshot)
            .setTimestamp()
            .setFooter({ text: 'A small step for X, a giant leap for X' });
        await interaction.reply({ embeds: [itemEmbed] });
	},
};
