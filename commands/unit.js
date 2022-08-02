const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUnit } = require('../utils/unitHelper');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('unit')
		.setDescription('Replies with information about a unit')
        .addStringOption(option => option.setName('unit_name').setDescription('Enter the name of the unit').setRequired(true)),

	async execute(interaction) {
        let unitName = interaction.options.getString('unit_name');
        const unitEmbed = await getUnit( unitName );
        await interaction.reply({ embeds: [unitEmbed] });
	},
};