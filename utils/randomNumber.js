const { minRandomNumber, maxRandomNumber } = require('./utils');

function getRandomNumber(number) {
    if (isNaN(number) ) {
        return `Syntax error. Please only input integers between \`${minRandomNumber}\` and \`${maxRandomNumber}\`.`
    }
    else if (number < minRandomNumber){
        return `Syntax error. Please only input integers between \`${minRandomNumber}\` and \`${maxRandomNumber}\`.\nYour number was \`${Math.abs(minRandomNumber - number)}\` below the min.`
    } else if (number > maxRandomNumber) {
        return `Syntax error. Please only input integers between \`${minRandomNumber}\` and \`${maxRandomNumber}\`.\nYour number was \`${number - maxRandomNumber}\` above the max.`
    } else {
        return Math.floor(Math.random() * number);
    }
}

module.exports = { getRandomNumber }