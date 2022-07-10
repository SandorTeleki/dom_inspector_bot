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
        const itemName = interaction.options.getString('item_name');
        const { body } = await request(ITEM_URL + encodeURIComponent(itemName));
        const { items } = await body.json();
        
        if (!items.length)
            await interaction.reply(`No results found for **${itemName}**.`);

        const [itemAnswer] = items;
		const itemEmbed = new MessageEmbed()
            .setTitle(itemAnswer.name)
            .setDescription('Mentor notes will go here.')
            .setImage(BASE_URL + itemAnswer.screenshot)
        await interaction.reply({ embeds: [itemEmbed] });
	},
};
