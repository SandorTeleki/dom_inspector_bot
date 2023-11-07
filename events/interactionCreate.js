const { Events } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();


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
				Created At: ${interaction.createdAt}
				Unix Timestamp: ${interaction.createdTimestamp}
				`)

			const commandContent = interaction.toString();
			
			let sql;

			// Connects to DB
			const db = new sqlite3.Database("./logs.db", sqlite3.OPEN_READWRITE,(err)=>{
				if(err) return console.error(err.message);
			});

			sql = `INSERT INTO logs(server_name,server_id,channel_name,channel_id,user_name,user_id,chat_command,unix_timestamp) VALUES (?,?,?,?,?,?,?,?)`
			db.run(sql,[interaction.guild.name,interaction.guild.id,interaction.channel.name,interaction.channel.id,interaction.user.tag,interaction.user.id,commandContent,interaction.createdTimestamp],(err) => {
				if(err) return console.error(err.message);
			});

		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};