const { SlashCommandBuilder } = require('@discordjs/builders');
const { getMerc } = require('../../utils/mercHelper');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('merc')
		.setDescription('Replies with information about a mercenary')
        .addStringOption(option => option.setName('merc_name').setDescription('Enter the name of the mercenary').setRequired(true)),

	async execute(interaction) {
		let mercName = interaction.options.getString('merc_name');
		var mercCommandData = interaction;
		try {
			let [mercEmbed, mercLeaderEmbed, mercTroopEmbed] = await getMerc(mercName, mercCommandData); 
			await interaction.reply({ embeds: [mercEmbed, mercLeaderEmbed, mercTroopEmbed] });
		}
		catch {
			const errorEmbed = new EmbedBuilder()
            	.setTitle("Nothing found. Better luck next time!")
            	.setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            await interaction.reply({ embeds: [errorEmbed]});
		}
	},
};
