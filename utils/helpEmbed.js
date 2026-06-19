const { EmbedBuilder } = require('discord.js');

function getHelpEmbed() {
	return new EmbedBuilder()
		.setTitle('Dom_Inspector_Bot help')
		.setDescription('The Dom_Inspector_Bot provides you info on items, spells, units, sites and mercenaries.')
		.addFields(
			{ name: '```/item {item_name} ```', value: 'Search for item by name (or id).' },
			{ name: '```/spell {spell_name}```', value: 'Search for spell by name (or id).' },
			{ name: '```/merc {merc_name}```', value: 'Search for mercenaries by mercenary group name (not leader name, but id is accepted).' },
			{ name: '```/site {site_name}```', value: 'Search for sites by name (or id).' },
			{ name: '```/unit {unit_name}```', value: 'Search for units (sacreds, indies, summons, commanders etc.) by name (or id).' },
			{ name: '```/random {random_number}```', value: 'Returns random number between 1 and the number you provide.' },
			{ name: '```/help```', value: 'Shows this help message.' },
			{ name: 'Tricks', value: 'Typos in names are fine, we\'ll do our best to understand you. Common aliases, like gss and FV for Greatsword of Sharpness and Foul Vapors, are understood. You can also supply the in-game ID instead of the name.' },
			{ name: 'Nota Bene', value: 'This bot only supports slash commands. Dominions 5 support is dropped due to dom5api hosting issues.' },
			{ name: 'Feedback', value: 'Feedback, suggestions, and bug reports are welcome on [GitHub](https://github.com/SandorTeleki/dom_inspector_bot), through DMs or through Discord pings.' },
			{ name: 'About', value: '[Dom_Inspector_Bot](https://github.com/SandorTeleki/dom_inspector_bot) uses [dom6api](https://github.com/Calioses/dom6api) and Larzm42\'s [dom6inspector](https://larzm42.github.io/dom6inspector/).' },
		);
}

module.exports = { getHelpEmbed };
