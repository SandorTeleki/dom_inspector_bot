const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

const { getMerc } = require('../../utils/mercHelper');
const { createLog } = require('../../utils/logHelper');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('merc')
		.setDescription('Replies with information about a mercenary')
        .addStringOption(option => option.setName('merc_name')
		.setDescription('Enter the name of the mercenary').setRequired(true)),

	async execute(interactionOG) {
		let mercName = interactionOG.options.getString('merc_name');
		var mercCommandData = interactionOG;
		try {
			let [mercEmbed, mercLeaderEmbed, mercTroopEmbed, mercLeaderButton, mercUnitButton] = await getMerc(mercName, mercCommandData);
			const buttonRow = new ActionRowBuilder().addComponents(mercLeaderButton, mercUnitButton);
	
			const response = await interactionOG.reply({ embeds: [mercEmbed], components: [buttonRow] });
		
			const collector = response.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 15_000,
				max: 2
			});
	
			collector.on('collect', (interaction) => {
				if (interaction.user.id === interactionOG.user.id){
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
				} else {
					interaction.reply({ content: `These buttons aren't for you!`, ephemeral: true });
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
