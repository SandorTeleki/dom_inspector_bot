const { SlashCommandBuilder } = require('@discordjs/builders');
const { getSite } = require('../../utils/siteHelper');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('site')
		.setDescription('Replies with information about a site')
        .addStringOption(option => option.setName('site_name').setDescription('Enter the name of the site').setRequired(true)),

	async execute(interaction) {
        const siteName = interaction.options.getString('site_name');
		var siteCommandData = interaction;
        const siteEmbed = await getSite( siteName, siteCommandData );
        await interaction.reply({ embeds: [siteEmbed] });
	},
};
