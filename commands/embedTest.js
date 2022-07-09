//Testing passing embed to a slash command
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('embedtest')
		.setDescription('Replies with an embed!'),
	async execute(interaction) {
		const testEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Frost Brand')
            .setURL('https://discord.js.org/')
            .setAuthor({ name: ' Timotej & Toldi' })
            .setDescription('Lot of hassle, but hey, it is working!')
            .setImage('https://dom5api.illwiki.com/items/14/screenshot')
            .setTimestamp()
            .setFooter({ text: 'A small step for Toldi, a giant leap for Discord Dom community' });
        await interaction.reply({ embeds: [testEmbed] });
	},
};



// const exampleEmbed = new MessageEmbed()
//     .setColor('#0099ff')
//     .setTitle('Frost Brand')
//     .setURL('https://discord.js.org/')
//     .setAuthor({ name: ' Timotej & Timotej' })
//     .setDescription('Lot of hassle, but hey, it is working!')
//     .setImage('https://dom5api.illwiki.com/items/14/screenshot')
//     .setTimestamp()
//     .setFooter({ text: 'A small step for Toldi, a giant leap for Discord Dom community' });
// message.reply({ embeds: [exampleEmbed] });