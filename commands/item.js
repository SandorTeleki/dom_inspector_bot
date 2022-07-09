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
                console.log(fullBody);
            }
            return JSON.parse(fullBody);
        }
        
        const itemName = interaction.options.getString('item_name');
		//const query = new URLSearchParams({ itemName });
        console.log(ITEM_URL + encodeURIComponent(itemName)); //### passes input into URL and shows it in console.log

		const itemSearchResult = await request(ITEM_URL + encodeURIComponent(itemName));
		const { list } = await getJSONResponse(itemSearchResult.body);
        console.log(list)

        // Tests for errors? Not working atm

		if (!list.length) {
			await interaction.reply(`No results found for **${itemName}**.`);
		}

		const [answer] = list;
        
		const itemEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(answer.name)
            .setURL('https://discord.js.org/')
            .setAuthor({ name: 'Timotej & Toldi' })
            .setDescription('Lot of hassle, but hey, it is working!')
            .setImage(BASE_URL + answer.screenshot)
            .setTimestamp()
            .setFooter({ text: 'A small step for Toldi, a giant leap for Discord Dom community' });
        await interaction.reply({ embeds: [itemEmbed] });
	},
};