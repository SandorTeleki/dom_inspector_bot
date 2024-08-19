const { SlashCommandBuilder } = require('@discordjs/builders');

const { getHelpEmbed } = require('../../utils/helpEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Gives information about the bot'),
		
	async execute(interaction) {
		await interaction.reply({ embeds: [getHelpEmbed()] });
	},
};
