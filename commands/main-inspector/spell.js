const { SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js'); //for buttons

const { getSpell } = require('../../utils/spellHelper');
const { buttonWrapper } = require('../../utils/buttonWrapper');
const { createLog } = require('../../utils/logHelper');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('spell')
		.setDescription('Replies with information about a spell')
        .addStringOption(option => option.setName('spell_name').setDescription('Enter the name of the spell').setRequired(true)),

	async execute(interactionOG) {
        let spellName = interactionOG.options.getString('spell_name');
		var spellCommandData = interactionOG;

		const [spellEmbed, buttons, buttonPrefix ] = await getSpell( spellName, spellCommandData );
		let maxButtonsToClick = buttons.length;
		const listID = buttons.map(button => button.data.custom_id);
		const buttonsArray = buttonWrapper(buttons);

        const response = await interactionOG.reply({ embeds: [spellEmbed], components: buttonsArray });
		
		const collector =  response.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 30_000,
			max: maxButtonsToClick
		});

		collector.on('collect', async (interaction) => {
			if (interaction.user.id === interactionOG.user.id){
				const interactionCustomID = interaction.customId;

				const isInListID = listID.some(id => id === interactionCustomID)
				if (isInListID){
					const justTheID = interaction.customId.replace(buttonPrefix, "");
					const [ spellEmbed ] = await getSpell( justTheID, interaction );
					createLog(interaction);

					await interaction.reply({embeds: [spellEmbed]});
					let arrayOfActionRows = interaction.message.components;
					const buttons = [];
					for (const actionRow of arrayOfActionRows){
						const ComponentsRow = actionRow.components;
						for (let a = 0; a < ComponentsRow.length; a++){
							const current = ComponentsRow[a];
							if(interactionCustomID === current.data.custom_id || current.data.disabled){
								const buttonBuilder = new ButtonBuilder()
									.setCustomId(`${current.data.custom_id}`)
									.setLabel(`${current.data.label}`)
									.setStyle(ButtonStyle.Secondary)
									.setDisabled(true);
								buttons.push(buttonBuilder);
							} else {
								const buttonBuilder = new ButtonBuilder()
									.setCustomId(`${current.data.custom_id}`)
									.setLabel(`${current.data.label}`)
									.setStyle(ButtonStyle.Secondary)
									.setDisabled(false);
								buttons.push(buttonBuilder)
							};
						}
					}
					const buttonsArray = buttonWrapper(buttons);

					response.edit({
						components: buttonsArray
					})
				}
			} else {
				interaction.reply({ content: `These buttons aren't for you!`, ephemeral: true });
			}
		});

		collector.on('end', (interaction) => {
			const arrayOfActionRows = buttonsArray;
			const buttons = [];
			for (const actionRow of arrayOfActionRows){
			  const componentsRow = actionRow.components;
			  for (let a = 0; a < componentsRow.length; a++){
				const current = componentsRow[a];
				buttons.push(
				  new ButtonBuilder()
						.setCustomId(`${current.data.custom_id}`)
						.setLabel(`${current.data.label}`)
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(true)
				);
			}
			const buttonsArray = buttonWrapper(buttons);

			response.edit({
				components: buttonsArray
			})
			}
		})
	},
};
