const { SlashCommandBuilder } = require('@discordjs/builders');
const { getSite } = require('../../utils/siteHelper');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('site')
		.setDescription('Replies with information about an site')
        .addStringOption(option => option.setName('site_name').setDescription('Enter the name of the site').setRequired(true)),

	async execute(interaction) {
        const siteName = interaction.options.getString('site_name');
        const siteEmbed = await getSite( siteName );
        await interaction.reply({ embeds: [siteEmbed] });
	},
};
