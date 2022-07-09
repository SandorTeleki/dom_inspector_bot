//For testing how input works in commands

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inputtest')
		.setDescription('Input Test Ofc!')
        .addStringOption(option => option.setName('inputtest').setDescription('Enter a string')),
	async execute(interaction) {
        const string = interaction.options.getString('inputtest');
        console.log(string);
		await interaction.reply('Check console.log!');
	},
};

