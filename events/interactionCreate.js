const { Events } = require('discord.js');

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
			console.log(`
				Server Name: ${interaction.guild.name} 
				Server ID: ${interaction.guild.id} 
				Channel Name: #${interaction.channel.name}
				Channel ID: #${interaction.channel.id}
				User: #${interaction.user.tag} 
				User ID: ${interaction.user.id} 
				Command: ${interaction}
				Time(createdAt): ${interaction.createdAt}
				Time(timestamp): ${interaction.createdTimestamp}
				`)
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};