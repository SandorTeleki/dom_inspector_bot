module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! (Test) Logged in as ${client.user.tag}`);
	},
};