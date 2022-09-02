const { SlashCommandBuilder } = require('@discordjs/builders');
const { getEntity } = require('../utils/itemHelper');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('item')
		.setDescription('Replies with information about an item')
        .addStringOption(option => option.setName('item_name').setDescription('Enter the name of the item').setRequired(true)),

	async execute(interaction) {
        let entityName = interaction.options.getString('item_name');
        const entityEmbed = await getEntity(entityName );
        await interaction.reply({ embeds: [entityEmbed] });
	},
};
