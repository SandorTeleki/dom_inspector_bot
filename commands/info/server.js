const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Displays info about the server'),
	async execute(interaction) {
		await interaction.reply(
		`Server name: ${interaction.guild.name}
		\nTotal members: ${interaction.guild.memberCount}`);
	},
};