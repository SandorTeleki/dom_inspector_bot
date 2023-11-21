const { SlashCommandBuilder } = require('@discordjs/builders');
//const { getUnit } = require('../../utils/unitHelper');
const { getUnit } = require('../../utils/unitSlashHelper');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('unit')
		.setDescription('Replies with information about a unit')
        .addStringOption(option => option.setName('unit_name').setDescription('Enter the name of the unit').setRequired(true)),

	async execute(interaction) {
        let unitName = interaction.options.getString('unit_name');
		var unitInteraction = interaction;
        const unitEmbed = await getUnit( unitName, unitInteraction );
        await interaction.reply({ embeds: [unitEmbed] });
	},
};