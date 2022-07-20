const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { COMMANDER_URL, BASE_URL } = require('../utils/utils');
const { commanderAliases } = require('../utils/commanderAliases')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('commander')
		.setDescription('Replies with information about a commander')
        .addStringOption(option => option.setName('commander_name').setDescription('Enter the name of the commander').setRequired(true)),

	async execute(interaction) {
        let commanderName = interaction.options.getString('commander_name');
        if (commanderName in commanderAliases){ commanderName = commanderAliases[commanderName] };
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
