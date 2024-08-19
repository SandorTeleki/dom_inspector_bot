const { SlashCommandBuilder } = require('@discordjs/builders');

const { getRandomNumber } = require('../../utils/randomNumber');
const { minRandomNumber, maxRandomNumber } = require('../../utils/utils')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('Provides a random number between 0 and the number the user provides.')
        .addStringOption(option => option.setName('random_number').setDescription('Enter the upper limit of your random number').setRequired(true)),
	async execute(interaction) {
        let randomNumber = interaction.options.getString('random_number');
		const regEx = /^(\d+)/;
		const randomMatch = randomNumber.match(regEx);
		// Error handling if random syntax is incorrect
		if (randomMatch === null) {
			interaction.reply(`Syntax error. Please only input integers between \`${minRandomNumber}\` and \`${maxRandomNumber}\`.`);
			return;
		} else if (randomNumber > maxRandomNumber) {
			interaction.reply(`Syntax error. Please only input integers between \`${minRandomNumber}\` and \`${maxRandomNumber}\`.\nYour number was \`${randomNumber - maxRandomNumber}\` above the max.`);
			return;
		} else if (randomNumber < minRandomNumber) {
			interaction.reply(`Syntax error. Please only input integers between \`${minRandomNumber}\` and \`${maxRandomNumber}\`.\nYour number was \`${Math.abs(minRandomNumber - randomNumber)}\` below the min.`);
			return;
		}
		const numberUsed = randomMatch[1];
		//Possibly make a slash command of this as well
		const response = getRandomNumber(numberUsed);
		interaction.reply(`Your random number is: \`${response}\` out of \`${numberUsed}\`.`);
	},
};
