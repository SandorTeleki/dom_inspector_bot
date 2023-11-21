const { SlashCommandBuilder } = require('@discordjs/builders');
// const { getItem } = require('../../utils/itemHelper');
const { getItem } = require('../../utils/itemSlashHelper');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('item')
		.setDescription('Replies with information about an item')
        .addStringOption(option => option.setName('item_name').setDescription('Enter the name of the item').setRequired(true)),

	async execute(interaction) {
        let itemName = interaction.options.getString('item_name');
		var itemInteraction = interaction;
        const itemEmbed = await getItem( itemName, itemInteraction );
        await interaction.reply({ embeds: [itemEmbed] });
	},
};
