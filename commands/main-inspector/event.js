const { SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require('discord.js'); //for buttons

const { getEvent } = require('../../utils/helpers/eventHelper');
const { buttonWrapper } = require('../../utils/buttonWrapper');
const { createLog } = require('../../utils/logHelper');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('event')
		.setDescription('Replies with information about an event.')
        .addStringOption(option => option.setName('event_name').setDescription('Enter some text (or id) of the event.').setRequired(true)),

	async execute(interactionOG) {
        const eventName = interactionOG.options.getString('event_name');
		let eventCommandData = interactionOG;

		const [eventEmbed, buttons, buttonPrefix, files ] = await getEvent( eventName, eventCommandData );
		let maxButtonsToClick = buttons.length;
		const listID = buttons.map(button => button.data.custom_id);
		const buttonsArray = buttonWrapper(buttons);

        const response = await interactionOG.reply({ embeds: [eventEmbed], components: buttonsArray, files });
		
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
					const [ eventEmbed, , , eventFiles ] = await getEvent( justTheID, interaction );
					createLog(interaction);

					await interaction.reply({embeds: [eventEmbed], files: eventFiles});
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
				interaction.reply({ content: `These buttons aren't for you!`, flags: MessageFlags.Ephemeral });
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
