const { SlashCommandBuilder } = require('@discordjs/builders');
//const { getSpell } = require('../../utils/spellHelper');
const { getSpell } = require('../../utils/spellSlashHelper');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('spell')
		.setDescription('Replies with information about a spell')
        .addStringOption(option => option.setName('spell_name').setDescription('Enter the name of the spell').setRequired(true)),

	async execute(interaction) {
        let spellName = interaction.options.getString('spell_name');
		var spellInteraction = interaction;
        const spellEmbed = await getSpell( spellName, spellInteraction );
        await interaction.reply({ embeds: [spellEmbed] });
	},
};
