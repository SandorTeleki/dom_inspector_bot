const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { fetch } = require('node-fetch');
const { ITEM_URL } = require('../utils/utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('item')
		.setDescription('Replies with information about an item')
        .addStringOption(option => option.setName('item_name').setDescription('Enter the name of the item')),

	async execute(interaction) {
        const string = interaction.options.getString('item_name');
        console.log(ITEM_URL + encodeURIComponent(string)); //### passes input into URL and shows it in console.log
        // fetch(ITEM_URL + encodeURIComponent(string))
        //     .then(res => res.JSON())
        //     .then(JSON => console.log(JSON))
		const itemEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Frost Brand')
            .setURL('https://discord.js.org/')
            .setAuthor({ name: 'Timotej & Toldi' })
            .setDescription('Lot of hassle, but hey, it is working!')
            .setImage('https://dom5api.illwiki.com/items/14/screenshot')
            .setTimestamp()
            .setFooter({ text: 'A small step for Toldi, a giant leap for Discord Dom community' });
        await interaction.reply({ embeds: [itemEmbed] });
	},
};