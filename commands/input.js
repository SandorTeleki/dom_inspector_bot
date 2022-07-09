//For testing how input works in commands

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('input')
		.setDescription('Input Test Ofc!')
        .addStringOption(option => option.setName('input').setDescription('Enter a string')),
	async execute(interaction) {
        const string = interaction.options.getString('input');
        console.log(string);
		await interaction.reply('Check console.log!');
	},
};

