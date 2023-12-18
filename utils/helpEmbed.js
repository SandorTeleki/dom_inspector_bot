const { EmbedBuilder } = require('discord.js');

function getHelpEmbed(){
	return new EmbedBuilder()
		.setTitle('Dom_Inspector_Bot help')
		.setDescription('The Dom_Inspector_Bot provides you info on items, spells, units, sites and mercenaries.')
		.addFields(
			{ name :  "```/item {item_name} ```", value: 'Search for item by name.'},
			{ name : '```/spell {spell_name}```', value: 'Search for spell by name.'},
			{ name : '```/merc {merc_name}```', value: 'Search for mercenaries by mercenary group name (not leader name).'},
			{ name : '```/site {site_name}```', value: 'Search for sites by name.'},
			{ name : '```/unit {unit_name}```', value: 'Search for units (sacreds, indies, summons, commanders etc.) by name.'},
			{ name : '```?{command}```', value: 'All slash commands can be used with "?" prefix as well, e.g. "?item frost brand"'},
			{ name : 'Tricks', value: 'Typos in names are fine, we\'ll do our best to understand you. Common aliases, like gss and FV for Greatsword of Sharpness and Foul Vapors, are understood. You can also supply the in-game ID instead of the name'},
			{ name: 'Scribbles', value: 'Notes/scribbles are currently in beta testing. An announcement will be made once they are fully released. Guilds/servers will be able to opt-in to have them.'},
			{ name : 'Feedback', value: 'Feedback, suggestions, and bug reports are welcome on [GitHub](https://github.com/SandorTeleki/dom_inspector_bot), through DMs or through Discord pings.'},
			{ name : 'About', value: "[Dom_Inspector_Bot](https://github.com/SandorTeleki/dom_inspector_bot) and [dom5api](https://github.com/gtim/dom5api) were created by Timotej and Toldi, using Larzm42's [dom5inspector](https://larzm42.github.io/dom5inspector/)."},
		)
}

module.exports = { getHelpEmbed }
