const { SlashCommandBuilder } = require('@discordjs/builders');
const { getMerc } = require('../utils/mercHelper');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('merc')
		.setDescription('Replies with information about a merc')
        .addStringOption(option => option.setName('merc_name').setDescription('Enter the name of the mercenary').setRequired(true)),

	async execute(interaction) {
                let mercName = interaction.options.getString('merc_name');
                let [mercEmbed, mercLeaderEmbed, mercTroopEmbed] = await getMerc(mercName);
                await interaction.reply({ embeds: [mercEmbed, mercLeaderEmbed, mercTroopEmbed] });
	},
};
