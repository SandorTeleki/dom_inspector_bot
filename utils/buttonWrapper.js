const { ActionRowBuilder } = require('discord.js');

function buttonWrapper(buttons){
    const components = [];
    let row = new ActionRowBuilder();

    for (let a = 0; a < buttons.length && a < 25; a++){
        if (a % 5 === 0 && a > 0){
            components.push(row);
            row = new ActionRowBuilder();
        }

        row.addComponents(buttons[a]);
        //console.log(row);
        //console.log(components);
    }
    if (row.components.length > 0){
        components.push(row)
    }

    return components;
}

module.exports = { buttonWrapper }