const { SlashCommandBuilder } = require('@discordjs/builders');

const { getRandomNumber } = require('../../utils/randomNumber');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('Provides a random number between 0 and the number the user provides.')
        .addStringOption(option => option.setName('random_number').setDescription('Enter the upper limit of your random number').setRequired(true)),
	
	async execute(interaction) {
		let randomNumber = interaction.options.getString('random_number');
		const response = getRandomNumber(randomNumber);
		if(isNaN(response)) {
			interaction.reply(response);
		} else {
			interaction.reply(`Your random number is: \`${response}\` out of \`${randomNumber}\`.`)
		}
	},
};
