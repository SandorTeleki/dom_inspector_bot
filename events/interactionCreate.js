const { Events } = require('discord.js');

const { sqlInsertLog } = require('../utils/sqlHelper');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
			const server = interaction.guild.name;
			const serverId = interaction.guild.id;
			const channelName = interaction.channel.name;
			const channelId = interaction.channel.id;
			const user = interaction.user.tag;
			const userId = interaction.user.id;
			const text = interaction.toString();
			const unixTimestamp = interaction.createdTimestamp;
			
			sqlInsertLog(server,serverId,channelName,channelId,user,userId,text,unixTimestamp);

		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};