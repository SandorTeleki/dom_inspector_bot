const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { request } = require('undici');
const { MERC_URL, BASE_URL } = require('../utils/utils');
const { mercAliases } = require('../utils/mercAliases')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('merc')
		.setDescription('Replies with information about a merc')
        .addStringOption(option => option.setName('merc_name').setDescription('Enter the name of the mercenary').setRequired(true)),

	async execute(interaction) {
        let mercName = interaction.options.getString('merc_name');
        if (mercName in mercAliases){ mercName = mercAliases[mercName] };
        const { body } = await request(MERC_URL + encodeURIComponent(mercName));
        const { mercs } = await body.json();
        
        if (!mercs.length)
            await interaction.reply(`No results found for **${mercName}**.`);

        const [mercAnswer] = mercs;
        //console.log(mercAnswer);
		const mercEmbed = new MessageEmbed()
            .setTitle(mercAnswer.name)
            .setDescription('Mentor notes will go here.')
            .setImage(BASE_URL + mercAnswer.screenshot)
        const mercLeaderEmbed = new MessageEmbed()
            .setImage(BASE_URL+'/commanders/'+mercAnswer.commander_id+'/screenshot')
            .setDescription('Name of mercenary group leader: '+mercAnswer.bossname)
        const mercTroopEmbed = new MessageEmbed()
            .setImage(BASE_URL+'/commanders/'+mercAnswer.unit_id+'/screenshot')
            .setDescription('Number of units: '+mercAnswer.nrunits)
        await interaction.reply({ embeds: [mercEmbed, mercLeaderEmbed, mercTroopEmbed] });
	},
};
