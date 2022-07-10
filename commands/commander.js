const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { COMMANDER_URL, BASE_URL } = require('../utils/utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('commander')
		.setDescription('Replies with information about a commander')
        .addStringOption(option => option.setName('commander_name').setDescription('Enter the name of the commander')),

	async execute(interaction) {
        const commanderName = interaction.options.getString('commander_name');
        const { body } = await request(COMMANDER_URL + encodeURIComponent(commanderName));
        const { commanders } = await body.json();
        
        if (!commanders.length)
            await interaction.reply(`No results found for **${commanderName}**.`);

        const [commanderAnswer] = commanders;
		const commanderEmbed = new MessageEmbed()
            .setTitle(commanderAnswer.name)
            .setDescription('Mentor notes will go here.')
            .setImage(BASE_URL + commanderAnswer.screenshot)
        await interaction.reply({ embeds: [commanderEmbed] });
	},
};
