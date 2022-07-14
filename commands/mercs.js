const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { MERC_URL, BASE_URL } = require('../utils/utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('merc')
		.setDescription('Replies with information about a merc')
        .addStringOption(option => option.setName('merc_name').setDescription('Enter the name of the mercenary').setRequired(true)),

	async execute(interaction) {
        const mercName = interaction.options.getString('merc_name');
        const { body } = await request(MERC_URL + encodeURIComponent(mercName));
        const { mercs } = await body.json();
        
        if (!mercs.length)
            await interaction.reply(`No results found for **${mercName}**.`);

        const [mercAnswer] = mercs;
		const mercEmbed = new MessageEmbed()
            .setTitle(mercAnswer.name)
            .setDescription('Mentor notes will go here.')
            .setImage(BASE_URL + mercAnswer.screenshot)
        await interaction.reply({ embeds: [mercEmbed] });
	},
};
