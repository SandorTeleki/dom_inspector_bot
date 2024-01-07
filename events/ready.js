const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		const currentTime = new Date();
		console.log(`Ready! Logged in as ${client.user.tag}. At: ${currentTime}.
		\n------------------------------------------------------------------------------------------------`);
	},
};