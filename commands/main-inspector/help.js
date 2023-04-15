const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const { getHelpEmbed } = require('../../utils/helpEmbed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Gives some information on the bot'),
	async execute(interaction) {
		await interaction.reply({ embeds: [getHelpEmbed()] });
	},
};
