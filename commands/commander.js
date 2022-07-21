const { SlashCommandBuilder } = require('@discordjs/builders');
const { getCommander } = require('../utils/commanderHelper')


module.exports = {
	data: new SlashCommandBuilder()
		.setName('commander')
		.setDescription('Replies with information about a commander')
        .addStringOption(option => option.setName('commander_name').setDescription('Enter the name of the commander').setRequired(true)),

	async execute(interaction) {
        let commanderName = interaction.options.getString('commander_name');
        const commanderEmbed = await getCommander( commanderName );
        await interaction.reply({ embeds: [commanderEmbed] });
	},
};
