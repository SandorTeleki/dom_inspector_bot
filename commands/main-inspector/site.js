const { SlashCommandBuilder } = require('@discordjs/builders');
const { ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js'); //for buttons

const { getSite } = require('../../utils/siteHelper');
const { buttonWrapper } = require('../../utils/buttonWrapper');
const { createLog } = require('../../utils/logHelper');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('site')
		.setDescription('Replies with information about a site')
        .addStringOption(option => option.setName('site_name').setDescription('Enter the name of the site').setRequired(true)),

	async execute(interactionOG) {
        const siteName = interactionOG.options.getString('site_name');
		let siteCommandData = interactionOG;

		const [siteEmbed, buttons, buttonPrefix ] = await getSite( siteName, siteCommandData );
		let maxButtonsToClick = buttons.length;
		const listID = buttons.map(button => button.data.custom_id);
		const buttonsArray = buttonWrapper(buttons);

        const response = await interactionOG.reply({ embeds: [siteEmbed], components: buttonsArray });
		
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
					const [ siteEmbed ] = await getSite( justTheID, interaction );
					createLog(interaction);

					await interaction.reply({embeds: [siteEmbed]});
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
