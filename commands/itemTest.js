//Testing commands

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('itemtest')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Frost!');
	},
};