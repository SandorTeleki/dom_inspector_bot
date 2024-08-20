const { ButtonBuilder, ButtonStyle } = require('discord.js');

function buttonCreator(similarMatchesList, buttonPrefix){
    const buttons = []
    for (let a = 0; a < similarMatchesList.length; a++){
        const current = similarMatchesList[a];
        buttons.push(
            new ButtonBuilder()
                .setCustomId(`${buttonPrefix}${current.id}`)
                .setLabel(`${current.name} [${current.id}]`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(false)
        );
    }
    return buttons;
}

module.exports = { buttonCreator }