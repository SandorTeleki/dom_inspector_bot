const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ComponentType, MessageFlags } = require('discord.js');

const { getMerc } = require('../../utils/helpers/mercHelper');
const { createLog } = require('../../utils/logHelper');
const { notFoundResult } = require('../../utils/notFoundResult');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('merc')
		.setDescription('Replies with information about a mercenary group.')
        .addStringOption(option => option.setName('merc_name').setDescription('Enter the name (or id) of the mercenary group.').setRequired(true)),

	async execute(interactionOG) {
		let mercName = interactionOG.options.getString('merc_name');
		let mercCommandData = interactionOG;
		try {
			let [mercEmbed, mercLeaderEmbed, mercTroopEmbed, mercLeaderButton, mercUnitButton, mercFiles, leaderFiles, troopFiles] = await getMerc(mercName, mercCommandData);

			if (!mercLeaderButton || !mercUnitButton) {
				await interactionOG.reply({ embeds: [mercEmbed], files: mercFiles });
				return;
			}

			const buttonRow = new ActionRowBuilder().addComponents(mercLeaderButton, mercUnitButton);
	
			const response = await interactionOG.reply({ embeds: [mercEmbed], components: [buttonRow], files: mercFiles });
		
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
						interaction.reply({ embeds: [mercLeaderEmbed], files: leaderFiles });
						createLog(interaction);
					}

					if (interaction.customId === 'merc-unit'){
						mercUnitButton.setDisabled(true);
						response.edit({
							components: [buttonRow]
						})
						interaction.reply({ embeds: [mercTroopEmbed], files: troopFiles });
						createLog(interaction);
					}
				} else {
					interaction.reply({ content: `These buttons aren't for you!`, flags: MessageFlags.Ephemeral });
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
			const [errorEmbed, , , files] = notFoundResult();
            await interactionOG.reply({ embeds: [errorEmbed], files });
		}
	},
};
