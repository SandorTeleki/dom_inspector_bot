const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { SPELL_URL, BASE_URL } = require('../utils/utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('spell')
		.setDescription('Replies with information about a spell')
        .addStringOption(option => option.setName('spell_name').setDescription('Enter the name of the spell').setRequired(true)),

	async execute(interaction) {
        const spellName = interaction.options.getString('spell_name');
        const { body } = await request(SPELL_URL + encodeURIComponent(spellName));
        const { spells } = await body.json();
        
        if (!spells.length)
            await interaction.reply(`No results found for **${spellName}**.`);

        const [answerSpell] = spells;
		const spellEmbed = new MessageEmbed()
            .setTitle(answerSpell.name)
            .setDescription('Mentor notes will go here.')
            .setImage(BASE_URL + answerSpell.screenshot)
        await interaction.reply({ embeds: [spellEmbed] });
	},
};
