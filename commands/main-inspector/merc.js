const { SlashCommandBuilder } = require('@discordjs/builders');
const { getMerc } = require('../../utils/mercHelper');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('merc')
		.setDescription('Replies with information about a mercenary')
        .addStringOption(option => option.setName('merc_name').setDescription('Enter the name of the mercenary').setRequired(true)),

	async execute(interaction) {
		let mercName = interaction.options.getString('merc_name');
		var mercCommandData = interaction;
		try {
			let [mercEmbed, mercLeaderEmbed, mercTroopEmbed, mercLeaderButton, mercUnitButton] = await getMerc(mercName, mercCommandData);
			const buttonRow = new ActionRowBuilder().addComponents(mercLeaderButton, mercUnitButton);
	
			const response = await interaction.reply({ embeds: [mercEmbed], components: [buttonRow] });
	
			const filter = (i) => i.user.id === interaction.user.id;
	
			const collector = response.createMessageComponentCollector({
				componentType: ComponentType.Button,
				filter,
				time: 15_000,
				max: 2
				});
	
			collector.on('collect', (interaction) => {
				if (interaction.customId === 'merc-leader'){
					mercLeaderButton.setDisabled(true);
					response.edit({
						components: [buttonRow]
					})
					interaction.reply({ embeds: [mercLeaderEmbed]});
	
				}
				if (interaction.customId === 'merc-unit'){
					mercUnitButton.setDisabled(true);
					response.edit({
						components: [buttonRow]
					})
					interaction.reply({ embeds: [mercTroopEmbed]});
				}
			});
	
			collector.on('end', () => {
				mercLeaderButton.setDisabled(true);
				mercUnitButton.setDisabled(true);
	
				response.edit({
					components: [buttonRow]
				})
			})
		} catch {
			const errorEmbed = new EmbedBuilder()
            	.setTitle("Nothing found. Better luck next time!")
            	.setImage('https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569_960_720.jpg');
            await interaction.reply({ embeds: [errorEmbed]});
		}
	},
};
