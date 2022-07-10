const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { SPELL_URL, BASE_URL } = require('../utils/utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('spell')
		.setDescription('Replies with information about a spell')
        .addStringOption(option => option.setName('spell_name').setDescription('Enter the name of the spell')),

	async execute(interaction) {
        async function getJSONResponse(body) {
            let fullBody = '';
            for await (const data of body) {
                fullBody += data.toString();
            }
            return JSON.parse(fullBody);
        }
        const spellName = interaction.options.getString('spell_name');
		
		const spellSearchResult = await request(SPELL_URL + encodeURIComponent(spellName));
		const response = await getJSONResponse(spellSearchResult.body);

		const spells = response.spells;
		const firstSpell = response.spells[0];
        
		const spellEmbed = new MessageEmbed()
            .setTitle(firstSpell.name)
            .setDescription('Mentor notes will go here.')
            .setImage(BASE_URL + firstSpell.screenshot)
        await interaction.reply({ embeds: [spellEmbed] });
	},
};
