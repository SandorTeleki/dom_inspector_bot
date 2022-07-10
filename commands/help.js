const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Gives some information on the bot'),
	async execute(interaction) {
		const testEmbed = new MessageEmbed()
            .setTitle('Help for Dom_Inspector_Bot use')
            .setDescription('List of commands for the bot:')
            .addFields(
                { name : '/item {item_name}', value: 'Use this command to search for items. Replace {item_name} with the name of the item. Minor typos in item name are fine.'},
                { name : '/spell {spell_name}', value: 'Use this command to search for spells. Replace {spell_name} with the name of the spell. Minor typos in spell name are fine.'},
                { name : '/commander {commander_name}', value: 'Use this command to search for commanders (mages, heroes, pretenders etc.). Replace {commander_name} with the name of the commander. Minor typos in commander name are fine.'},
                { name : '/event {event_name}', value: 'work in progress'},
            )
            .setFooter({ text: "A bot by Timotej and Toldi.\nOriginally created for the Immersion server!\nBased on Larzm42's Dominions 5 Inspector: https://larzm42.github.io/dom5inspector/" });
        await interaction.reply({ embeds: [testEmbed] });
	},
};