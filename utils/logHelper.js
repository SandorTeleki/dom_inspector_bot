const { EmbedBuilder } = require('discord.js');
const { sqlInsertLog } = require('./sqlHelper');

const LOG_CHANNEL_ID = '1165999070272303174';

function getInteractionLogText(interaction) {
	if (interaction.isChatInputCommand()) {
		return interaction.toString();
	}
	return interaction.customId;
}

function createLog(interaction) {
	sqlInsertLog(
		interaction.guild.name,
		interaction.guild.id,
		interaction.channel.name,
		interaction.channel.id,
		interaction.user.tag,
		interaction.user.id,
		getInteractionLogText(interaction),
		interaction.createdTimestamp,
	);
}

async function createLogEmbed(interaction) {
	const channel = interaction.client.channels.cache.get(LOG_CHANNEL_ID);
	if (!channel) return;

	const logEmbed = new EmbedBuilder()
		.setTitle('Slash command used')
		.addFields({ name: 'Server Name', value: `${interaction.guild.name}` })
		.addFields({ name: 'Server ID', value: `${interaction.guild.id}` })
		.addFields({ name: 'Channel Name', value: `${interaction.channel.name}` })
		.addFields({ name: 'Channel ID', value: `${interaction.channel.id}` })
		.addFields({ name: 'User Name', value: `${interaction.user.tag}` })
		.addFields({ name: 'User ID', value: `${interaction.user.id}` })
		.addFields({ name: 'Command', value: `${getInteractionLogText(interaction)}` })
		.addFields({ name: 'Created At', value: `${interaction.createdAt}` })
		.addFields({ name: 'Unix Timestamp', value: `${interaction.createdTimestamp}` });

	await channel.send({ embeds: [logEmbed] });
}

module.exports = { createLog, createLogEmbed };
