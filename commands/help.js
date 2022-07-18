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
                { name :  "```/item {item_name} ```", value: 'Use this command to search for items. Replace {item_name} with the name of the item. Minor typos in item name are fine.'},
                { name : '```/spell {spell_name}```', value: 'Use this command to search for spells. Replace {spell_name} with the name of the spell. Minor typos in spell name are fine.'},
                { name : '```/commander {commander_name}```', value: 'Use this command to search for commanders (mages, heroes, pretenders etc.). Replace {commander_name} with the name of the commander. Minor typos in commander name are fine.'},
                { name : '```/merc {merc_name}```', value: 'Use this command to search for mercenaries. Replace {merc_name} with the name of the mercenary group (not the boss name, although we might add that later). Minor typos in merc name are fine.'},
                { name : '```/site {site_name}```', value: 'Use this command to search for sites. Replace {site_name} with the name of the site. Minor typos in site name are fine.'},
                { name : '```/event {event_name}```', value: 'work in progress'},
                { name : '```?{command_name}```', value: 'All slash commands will work if you type them normally with the "?" prefix before them. Like "?item frost brand"'},
                { name : 'Source/background', value: "Based on Larzm42's Dominions 5 Inspector: [Dom5Inspector](https://larzm42.github.io/dom5inspector/)"},
            )
            .setFooter({ text: "A bot by Timotej and Toldi.\nOriginally created for the Immersion server!" });
        await interaction.reply({ embeds: [testEmbed] });
	},
};
