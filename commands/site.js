const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { SITE_URL, BASE_URL } = require('../utils/utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('site')
		.setDescription('Replies with information about an site')
        .addStringOption(option => option.setName('site_name').setDescription('Enter the name of the site').setRequired(true)),

	async execute(interaction) {
        const siteName = interaction.options.getString('site_name');
        const { body } = await request(SITE_URL + encodeURIComponent(siteName));
        const { sites } = await body.json();
        
        if (!sites.length)
            await interaction.reply(`No results found for **${siteName}**.`);

        const [siteAnswer] = sites;
		const siteEmbed = new MessageEmbed()
            .setTitle(siteAnswer.name)
            .setDescription('Mentor notes will go here.')
            .setImage(BASE_URL + siteAnswer.screenshot)
        await interaction.reply({ embeds: [siteEmbed] });
	},
};
